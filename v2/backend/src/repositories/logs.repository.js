import { pool } from '../database/pool.js';

export async function insertLog({ userId, action, target }) {
  await pool.query(
    'INSERT INTO logs (user_id, action, target) VALUES ($1, $2, $3)',
    [userId, action, target]
  );
}

export async function listRecentLogs(limit = 50) {
  const result = await pool.query(
    `SELECT l.id, l.action, l.target, l.created_at, u.name AS user_name
     FROM logs l
     LEFT JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}
