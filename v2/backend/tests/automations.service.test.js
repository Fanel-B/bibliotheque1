import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compare, evaluateAutomations } from '../src/services/automations.service.js';
import * as automationsRepository from '../src/repositories/automations.repository.js';
import * as iotRepository from '../src/repositories/iot.repository.js';

vi.mock('../src/repositories/automations.repository.js');
vi.mock('../src/repositories/iot.repository.js');

describe('compare', () => {
  it.each([
    [26, '>', 25, true],
    [25, '>', 25, false],
    [24, '<', 25, true],
    [25, '<', 25, false],
    [25, '>=', 25, true],
    [25, '<=', 25, true],
    [26, '<=', 25, false],
  ])('%s %s %s → %s', (valeur, operateur, seuil, attendu) => {
    expect(compare(valeur, operateur, seuil)).toBe(attendu);
  });

  it('un opérateur inconnu ne déclenche jamais', () => {
    expect(compare(100, '==', 100)).toBe(false);
    expect(compare(100, undefined, 0)).toBe(false);
  });
});

describe('evaluateAutomations', () => {
  const automatisationClim = (extra = {}) => ({
    id: 1,
    name: 'Clim si chaud',
    enabled: true,
    condition_json: { zone: 'Rayon A', metric: 'temperature', operator: '>', value: 25 },
    action_json: { deviceName: 'Ventilation Rayon A', state: 'on' },
    ...extra,
  });

  function snapshot({ valeur = 27, offline = false, etat = 'off' } = {}) {
    return {
      zones: [
        {
          name: 'Rayon A',
          sensors: [{ type: 'temperature', value: valeur, offline }],
          devices: [{ id: 42, name: 'Ventilation Rayon A', current_state: etat }],
        },
      ],
    };
  }

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T14:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('déclenche l’action, journalise et met à jour la snapshot', async () => {
    automationsRepository.listAutomations.mockResolvedValue([automatisationClim()]);
    const snap = snapshot();

    const declenchees = await evaluateAutomations(snap);

    expect(declenchees).toEqual(['Clim si chaud']);
    expect(iotRepository.updateDeviceState).toHaveBeenCalledWith(42, 'on');
    expect(automationsRepository.insertLog).toHaveBeenCalledWith(1, 27);
    expect(snap.zones[0].devices[0].current_state).toBe('on');
  });

  it('ignore une automatisation désactivée', async () => {
    automationsRepository.listAutomations.mockResolvedValue([automatisationClim({ enabled: false })]);
    expect(await evaluateAutomations(snapshot())).toEqual([]);
    expect(iotRepository.updateDeviceState).not.toHaveBeenCalled();
  });

  it('ne fait rien si la condition n’est pas remplie', async () => {
    automationsRepository.listAutomations.mockResolvedValue([automatisationClim()]);
    expect(await evaluateAutomations(snapshot({ valeur: 22 }))).toEqual([]);
  });

  it('ne fait rien si l’appareil est déjà dans l’état visé', async () => {
    automationsRepository.listAutomations.mockResolvedValue([automatisationClim()]);
    expect(await evaluateAutomations(snapshot({ etat: 'on' }))).toEqual([]);
    expect(automationsRepository.insertLog).not.toHaveBeenCalled();
  });

  it('ignore un capteur hors ligne ou sans valeur', async () => {
    automationsRepository.listAutomations.mockResolvedValue([automatisationClim()]);
    expect(await evaluateAutomations(snapshot({ offline: true }))).toEqual([]);
    expect(await evaluateAutomations(snapshot({ valeur: null }))).toEqual([]);
  });

  it('ignore une zone, un capteur ou un appareil inexistant', async () => {
    automationsRepository.listAutomations.mockResolvedValue([
      automatisationClim({ condition_json: { zone: 'Inconnue', metric: 'temperature', operator: '>', value: 0 } }),
      automatisationClim({ condition_json: { zone: 'Rayon A', metric: 'uv', operator: '>', value: 0 } }),
      automatisationClim({ action_json: { deviceName: 'Fantôme', state: 'on' } }),
    ]);
    expect(await evaluateAutomations(snapshot())).toEqual([]);
  });

  it('respecte "requireOpen" : rien la nuit, déclenchement en journée', async () => {
    const auto = automatisationClim({
      condition_json: { zone: 'Rayon A', metric: 'temperature', operator: '>', value: 25, requireOpen: true },
    });
    automationsRepository.listAutomations.mockResolvedValue([auto]);

    vi.setSystemTime(new Date('2026-03-10T23:00:00Z'));
    expect(await evaluateAutomations(snapshot())).toEqual([]);

    vi.setSystemTime(new Date('2026-03-10T10:00:00Z'));
    expect(await evaluateAutomations(snapshot())).toEqual(['Clim si chaud']);
  });
});
