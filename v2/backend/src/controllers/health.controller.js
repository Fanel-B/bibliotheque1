import { checkDatabaseHealth } from '../services/health.service.js';

export function getServerHealth(req, res) {
  res.json({ status: 'up' });
}

export async function getDatabaseHealth(req, res) {
  const health = await checkDatabaseHealth();
  res.json(health);
}
