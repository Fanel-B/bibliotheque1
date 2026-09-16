import { pool } from '../database/pool.js';

export async function listZones() {
  const result = await pool.query('SELECT id, name FROM iot_zones ORDER BY id');
  return result.rows;
}

export async function listDevices() {
  const result = await pool.query(
    'SELECT id, zone_id, type, name, controllable, current_state FROM iot_devices ORDER BY id'
  );
  return result.rows;
}

export async function listSensors() {
  const result = await pool.query(
    'SELECT id, zone_id, device_id, type, unit FROM sensors ORDER BY id'
  );
  return result.rows;
}

export async function getSensorById(id) {
  const result = await pool.query(
    'SELECT id, zone_id, device_id, type, unit FROM sensors WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getDeviceById(id) {
  const result = await pool.query(
    'SELECT id, zone_id, type, name, controllable, current_state FROM iot_devices WHERE id = $1',
    [id]
  );
  return result.rows[0] ?? null;
}

export async function updateDeviceState(id, state) {
  const result = await pool.query(
    'UPDATE iot_devices SET current_state = $2 WHERE id = $1 RETURNING id, zone_id, type, name, controllable, current_state',
    [id, state]
  );
  return result.rows[0] ?? null;
}

export async function insertReading(sensorId, value, recordedAt) {
  await pool.query(
    'INSERT INTO sensor_readings (sensor_id, value, recorded_at) VALUES ($1, $2, $3)',
    [sensorId, value, recordedAt]
  );
}

export async function getLatestReading(sensorId) {
  const result = await pool.query(
    `SELECT value, recorded_at FROM sensor_readings
     WHERE sensor_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
    [sensorId]
  );
  return result.rows[0] ?? null;
}

export async function insertReadingsBatch(sensorId, points) {
  if (points.length === 0) return;
  const values = [];
  const placeholders = points
    .map((point, i) => {
      const base = i * 3;
      values.push(sensorId, point.value, point.recordedAt);
      return `($${base + 1}, $${base + 2}, $${base + 3})`;
    })
    .join(', ');

  await pool.query(
    `INSERT INTO sensor_readings (sensor_id, value, recorded_at) VALUES ${placeholders}`,
    values
  );
}

export async function getReadingsSince(sensorId, since) {
  const result = await pool.query(
    `SELECT value, recorded_at FROM sensor_readings
     WHERE sensor_id = $1 AND recorded_at >= $2
     ORDER BY recorded_at ASC`,
    [sensorId, since]
  );
  return result.rows;
}

// Un "scénario" actif = un événement récent, pas encore expiré, qui altère
// temporairement la courbe de base d'une zone (ex: pic de température).
export async function getActiveScenarios(zoneId, now) {
  const result = await pool.query(
    `SELECT type, payload FROM events
     WHERE zone_id = $1
       AND type LIKE 'scenario_%'
       AND (payload->>'expiresAt')::timestamptz > $2`,
    [zoneId, now]
  );
  return result.rows;
}

// Supprime les boosts encore actifs pour cette zone+capteur avant d'en poser
// un nouveau, pour qu'un nouveau déclenchement remplace l'effet en cours
// plutôt que de s'y additionner.
export async function clearActiveScenarioBoosts(zoneId, sensorType, now) {
  await pool.query(
    `DELETE FROM events
     WHERE zone_id = $1
       AND type = 'scenario_boost'
       AND payload->>'sensorType' = $2
       AND (payload->>'expiresAt')::timestamptz > $3`,
    [zoneId, sensorType, now]
  );
}

export async function insertEvent({ type, zoneId, payload }) {
  const result = await pool.query(
    `INSERT INTO events (type, zone_id, payload) VALUES ($1, $2, $3)
     RETURNING id, type, zone_id, payload, created_at`,
    [type, zoneId, payload]
  );
  return result.rows[0];
}

export async function insertAlert({ eventId, severity }) {
  const result = await pool.query(
    `INSERT INTO alerts (event_id, severity) VALUES ($1, $2)
     RETURNING id, event_id, severity, acknowledged, created_at`,
    [eventId, severity]
  );
  return result.rows[0];
}

export async function listActiveAlerts() {
  const result = await pool.query(
    `SELECT a.id, a.severity, a.acknowledged, a.created_at,
            e.type AS event_type, e.zone_id, z.name AS zone_name, e.payload
     FROM alerts a
     JOIN events e ON e.id = a.event_id
     LEFT JOIN iot_zones z ON z.id = e.zone_id
     WHERE a.acknowledged = false
     ORDER BY a.created_at DESC`
  );
  return result.rows;
}

export async function acknowledgeAlert(id) {
  const result = await pool.query(
    'UPDATE alerts SET acknowledged = true WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rows[0] ?? null;
}
