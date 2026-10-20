import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isLibraryOpen,
  computeSensorValue,
  getZonesSnapshot,
  getSensorHistory,
  OPENING_HOUR,
  CLOSING_HOUR,
} from '../src/services/simulator.service.js';
import * as iotRepository from '../src/repositories/iot.repository.js';

vi.mock('../src/repositories/iot.repository.js');

const nuit = new Date('2026-03-10T03:00:00Z');
const aprem = new Date('2026-03-10T14:00:00Z');
const aucunAppareil = new Map();

describe('isLibraryOpen', () => {
  it('horaires 8h–20h UTC', () => {
    expect(OPENING_HOUR).toBe(8);
    expect(CLOSING_HOUR).toBe(20);
  });

  it('ouverte pile à l’heure d’ouverture, fermée pile à l’heure de fermeture', () => {
    expect(isLibraryOpen(new Date('2026-03-10T08:00:00Z'))).toBe(true);
    expect(isLibraryOpen(new Date('2026-03-10T19:59:00Z'))).toBe(true);
    expect(isLibraryOpen(new Date('2026-03-10T20:00:00Z'))).toBe(false);
  });

  it('fermée la nuit et juste avant l’ouverture', () => {
    expect(isLibraryOpen(nuit)).toBe(false);
    expect(isLibraryOpen(new Date('2026-03-10T07:59:00Z'))).toBe(false);
  });
});

describe('computeSensorValue', () => {
  const capteur = (type, extra = {}) => ({ id: 5, type, device_id: null, ...extra });

  it('est déterministe : mêmes entrées → même valeur', () => {
    const a = computeSensorValue(capteur('temperature'), aprem, [], aucunAppareil);
    const b = computeSensorValue(capteur('temperature'), aprem, [], aucunAppareil);
    expect(a).toEqual(b);
  });

  it('température de nuit ≈ 19 °C (± bruit), arrondie au dixième', () => {
    const { value, offline } = computeSensorValue(capteur('temperature'), nuit, [], aucunAppareil);
    expect(offline).toBe(false);
    expect(value).toBeGreaterThanOrEqual(18.6);
    expect(value).toBeLessThanOrEqual(19.4);
    expect(Math.round(value * 10) / 10).toBe(value);
  });

  it('la température est plus élevée au pic d’affluence que la nuit', () => {
    const jour = computeSensorValue(capteur('temperature'), aprem, [], aucunAppareil).value;
    expect(jour).toBeGreaterThan(22.5);
  });

  it('occupation nulle (au bruit près) quand la bibliothèque est fermée, jamais négative', () => {
    const { value } = computeSensorValue(capteur('occupation'), nuit, [], aucunAppareil);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(2);
    expect(Number.isInteger(value)).toBe(true);
  });

  it('applique les boosts de scénario du même type de capteur uniquement', () => {
    const sans = computeSensorValue(capteur('temperature'), nuit, [], aucunAppareil).value;
    const scenarios = [
      { type: 'scenario_boost', payload: { sensorType: 'temperature', boost: 6 } },
      { type: 'scenario_boost', payload: { sensorType: 'occupation', boost: 25 } },
    ];
    const avec = computeSensorValue(capteur('temperature'), nuit, scenarios, aucunAppareil).value;
    expect(avec).toBeCloseTo(sans + 6, 5);
  });

  it('ignore un boost non numérique', () => {
    const sans = computeSensorValue(capteur('temperature'), nuit, [], aucunAppareil).value;
    const scenarios = [{ type: 'scenario_boost', payload: { sensorType: 'temperature', boost: 'abc' } }];
    expect(computeSensorValue(capteur('temperature'), nuit, scenarios, aucunAppareil).value).toBe(sans);
  });

  it('un capteur lié à un appareil hors service est hors ligne', () => {
    const appareils = new Map([[9, { id: 9, current_state: 'offline' }]]);
    expect(computeSensorValue(capteur('temperature', { device_id: 9 }), aprem, [], appareils)).toEqual({
      value: null,
      offline: true,
    });
  });

  it('capteur de porte : 1 si ouverte, 0 sinon', () => {
    const ouverte = new Map([[9, { id: 9, current_state: 'open' }]]);
    const fermee = new Map([[9, { id: 9, current_state: 'closed' }]]);
    const porte = capteur('porte', { device_id: 9 });
    expect(computeSensorValue(porte, nuit, [], ouverte)).toEqual({ value: 1, offline: false });
    expect(computeSensorValue(porte, nuit, [], fermee)).toEqual({ value: 0, offline: false });
  });
});

describe('getZonesSnapshot', () => {
  beforeEach(() => vi.resetAllMocks());

  it('regroupe appareils et capteurs par zone avec leurs valeurs calculées', async () => {
    iotRepository.listZones.mockResolvedValue([{ id: 1, name: 'Hall' }, { id: 2, name: 'Archives' }]);
    iotRepository.listDevices.mockResolvedValue([
      { id: 10, zone_id: 2, name: 'Porte Archives', current_state: 'open' },
    ]);
    iotRepository.listSensors.mockResolvedValue([
      { id: 100, zone_id: 1, device_id: null, type: 'occupation' },
      { id: 200, zone_id: 2, device_id: 10, type: 'porte' },
    ]);
    iotRepository.getActiveScenarios.mockResolvedValue([]);

    const snapshot = await getZonesSnapshot();

    expect(snapshot.generatedAt).toEqual(expect.any(String));
    const [hall, archives] = snapshot.zones;
    expect(hall.devices).toEqual([]);
    expect(hall.sensors).toHaveLength(1);
    expect(archives.devices).toHaveLength(1);
    expect(archives.sensors[0]).toMatchObject({ id: 200, value: 1, offline: false });
    expect(iotRepository.getActiveScenarios).toHaveBeenCalledTimes(2);
  });
});

describe('getSensorHistory', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => vi.useRealTimers());

  it('renvoie null pour un capteur inconnu', async () => {
    iotRepository.getSensorById.mockResolvedValue(null);
    expect(await getSensorHistory(999, 24)).toBeNull();
  });

  it('comble l’historique par pas de 15 minutes depuis la dernière lecture', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T12:00:00Z'));
    iotRepository.getSensorById.mockResolvedValue({ id: 5, type: 'temperature', device_id: null });
    iotRepository.listDevices.mockResolvedValue([]);
    iotRepository.getLatestReading.mockResolvedValue({ recorded_at: '2026-03-10T11:00:00Z' });
    iotRepository.getReadingsSince.mockResolvedValue([{ value: 20 }]);

    const resultat = await getSensorHistory(5, 24);

    const [, points] = iotRepository.insertReadingsBatch.mock.calls[0];
    expect(points.map((p) => p.recordedAt.toISOString())).toEqual([
      '2026-03-10T11:15:00.000Z',
      '2026-03-10T11:30:00.000Z',
      '2026-03-10T11:45:00.000Z',
      '2026-03-10T12:00:00.000Z',
    ]);
    expect(resultat.readings).toEqual([{ value: 20 }]);
  });

  it('repart du début de la plage si la dernière lecture est trop ancienne', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T12:00:00Z'));
    iotRepository.getSensorById.mockResolvedValue({ id: 5, type: 'temperature', device_id: null });
    iotRepository.listDevices.mockResolvedValue([]);
    iotRepository.getLatestReading.mockResolvedValue({ recorded_at: '2026-01-01T00:00:00Z' });
    iotRepository.getReadingsSince.mockResolvedValue([]);

    await getSensorHistory(5, 24);

    const [, points] = iotRepository.insertReadingsBatch.mock.calls[0];
    // 24 h à 15 min d'intervalle = 96 points
    expect(points).toHaveLength(96);
    expect(points[0].recordedAt.toISOString()).toBe('2026-03-09T12:15:00.000Z');
  });
});
