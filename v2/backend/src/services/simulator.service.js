import * as iotRepository from '../repositories/iot.repository.js';

export const OPENING_HOUR = 8;
export const CLOSING_HOUR = 20;
const BACKFILL_INTERVAL_MINUTES = 15;

export function isLibraryOpen(date) {
  const h = date.getUTCHours() + date.getUTCMinutes() / 60;
  return h >= OPENING_HOUR && h < CLOSING_HOUR;
}

// Bruit pseudo-aléatoire mais déterministe : mêmes entrées → même sortie.
// Ça évite qu'une valeur "saute" à chaque rechargement de la page, tout en
// gardant un aspect naturel (recalculée toutes les 5 minutes).
function seededNoise(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 1000) / 1000) * 2 - 1; // dans [-1, 1]
}

// Courbe de fréquentation : 0 la nuit, monte le matin, pic vers 14h, redescend le soir.
function occupationCurve(date) {
  if (!isLibraryOpen(date)) return 0;
  const hourFrac = date.getUTCHours() + date.getUTCMinutes() / 60;
  const peak = 14;
  const spread = 4.5;
  return Math.exp(-((hourFrac - peak) ** 2) / (2 * spread ** 2));
}

const NOISE_AMPLITUDE = {
  temperature: 0.4,
  humidite: 2,
  luminosite: 15,
  uv: 0.2,
  occupation: 1.5,
};

function baseline(sensorType, date) {
  const occupation = occupationCurve(date);
  const open = isLibraryOpen(date);
  switch (sensorType) {
    case 'temperature':
      return 19 + occupation * 4.5; // 19°C vide -> ~23.5°C plein
    case 'humidite':
      return 35 + occupation * 15; // 35% -> 50%
    case 'luminosite':
      return open ? 300 + occupation * 400 : 4;
    case 'uv':
      return open ? 1 + occupation * 2 : 0;
    case 'occupation':
      return Math.round(occupation * 40);
    default:
      return 0;
  }
}

function roundForType(sensorType, value) {
  if (sensorType === 'temperature') return Math.round(value * 10) / 10;
  return Math.max(0, Math.round(value));
}

// scenarios: événements "scenario_boost" actifs pour la zone de ce capteur.
export function computeSensorValue(sensor, date, scenarios, deviceById) {
  const device = sensor.device_id ? deviceById.get(sensor.device_id) : null;

  if (sensor.type === 'porte') {
    if (device?.current_state === 'offline') return { value: null, offline: true };
    return { value: device?.current_state === 'open' ? 1 : 0, offline: false };
  }

  if (device?.current_state === 'offline') {
    return { value: null, offline: true };
  }

  let value = baseline(sensor.type, date);

  for (const scenario of scenarios) {
    if (scenario.type === 'scenario_boost' && scenario.payload.sensorType === sensor.type) {
      value += Number(scenario.payload.boost) || 0;
    }
  }

  const amplitude = NOISE_AMPLITUDE[sensor.type] ?? 0;
  const noiseSeed = `${sensor.id}-${Math.floor(date.getTime() / (5 * 60 * 1000))}`;
  value += seededNoise(noiseSeed) * amplitude;

  return { value: roundForType(sensor.type, value), offline: false };
}

export async function getZonesSnapshot() {
  const now = new Date();
  const [zones, devices, sensors] = await Promise.all([
    iotRepository.listZones(),
    iotRepository.listDevices(),
    iotRepository.listSensors(),
  ]);
  const deviceById = new Map(devices.map((d) => [d.id, d]));

  const zonesResult = await Promise.all(
    zones.map(async (zone) => {
      const zoneDevices = devices.filter((d) => d.zone_id === zone.id);
      const zoneSensors = sensors.filter((s) => s.zone_id === zone.id);
      const scenarios = await iotRepository.getActiveScenarios(zone.id, now);

      const sensorsWithValues = zoneSensors.map((sensor) => {
        const { value, offline } = computeSensorValue(sensor, now, scenarios, deviceById);
        return { ...sensor, value, offline };
      });

      return { ...zone, devices: zoneDevices, sensors: sensorsWithValues };
    })
  );

  return { zones: zonesResult, generatedAt: now.toISOString() };
}

// Comble les trous entre la dernière lecture stockée et maintenant, en
// recalculant la courbe de base à intervalle régulier. Ainsi, que le
// service ait tourné en continu ou ait dormi trois jours (hébergement
// gratuit oblige), l'historique affiché est toujours complet.
async function backfillReadings(sensor, since, now, deviceById) {
  const latest = await iotRepository.getLatestReading(sensor.id);
  let cursor = latest && new Date(latest.recorded_at) > since ? new Date(latest.recorded_at) : new Date(since);
  cursor = new Date(cursor.getTime() + BACKFILL_INTERVAL_MINUTES * 60 * 1000);

  const points = [];
  while (cursor <= now) {
    const { value, offline } = computeSensorValue(sensor, cursor, [], deviceById);
    if (!offline && value !== null) {
      points.push({ value, recordedAt: new Date(cursor) });
    }
    cursor = new Date(cursor.getTime() + BACKFILL_INTERVAL_MINUTES * 60 * 1000);
  }

  await iotRepository.insertReadingsBatch(sensor.id, points);
}

export async function getSensorHistory(sensorId, rangeHours) {
  const sensor = await iotRepository.getSensorById(sensorId);
  if (!sensor) return null;

  const now = new Date();
  const since = new Date(now.getTime() - rangeHours * 3600 * 1000);
  const devices = await iotRepository.listDevices();
  const deviceById = new Map(devices.map((d) => [d.id, d]));

  await backfillReadings(sensor, since, now, deviceById);

  const readings = await iotRepository.getReadingsSince(sensorId, since);
  return { sensor, readings };
}
