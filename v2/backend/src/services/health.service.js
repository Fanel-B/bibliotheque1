import { pingDatabase } from '../repositories/health.repository.js';

export async function checkDatabaseHealth() {
  try {
    const isUp = await pingDatabase();
    return { status: isUp ? 'up' : 'down' };
  } catch (error) {
    return { status: 'down', reason: error.message };
  }
}
