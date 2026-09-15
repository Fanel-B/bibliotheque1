import { pool } from '../database/pool.js';

export async function listAutomations() {
  const result = await pool.query(
    'SELECT id, name, condition_json, action_json, enabled FROM automations ORDER BY id'
  );
  return result.rows;
}

export async function setEnabled(id, enabled) {
  const result = await pool.query(
    `UPDATE automations SET enabled = $2 WHERE id = $1
     RETURNING id, name, condition_json, action_json, enabled`,
    [id, enabled]
  );
  return result.rows[0] ?? null;
}

export async function insertLog(automationId, triggeredValue) {
  await pool.query(
    'INSERT INTO automation_logs (automation_id, triggered_value) VALUES ($1, $2)',
    [automationId, triggeredValue]
  );
}

export async function listLogs(limit = 30) {
  const result = await pool.query(
    `SELECT al.id, al.triggered_value, al.executed_at, a.name AS automation_name
     FROM automation_logs al
     JOIN automations a ON a.id = al.automation_id
     ORDER BY al.executed_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}
