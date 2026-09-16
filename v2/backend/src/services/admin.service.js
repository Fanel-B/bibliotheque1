import * as analyticsRepository from '../repositories/analytics.repository.js';
import { listAllUsers, setUserRole } from '../repositories/users.repository.js';
import { insertLog, listRecentLogs } from '../repositories/logs.repository.js';
import { listAllLoans } from '../repositories/loans.repository.js';
import { HttpError } from '../utils/HttpError.js';

export const getOverview = analyticsRepository.getOverview;
export const getPopularBooks = analyticsRepository.getPopularBooks;
export const getPopularGenres = analyticsRepository.getPopularGenres;
export const getLoanTrends = analyticsRepository.getLoanTrends;
export const getUsers = listAllUsers;
export const getLogs = listRecentLogs;
export const getAllLoans = listAllLoans;

export async function changeUserRole({ targetUserId, role, actingUserId }) {
  if (targetUserId === actingUserId) {
    throw new HttpError(400, 'Tu ne peux pas changer ton propre rôle.');
  }

  const user = await setUserRole(targetUserId, role);
  if (!user) {
    throw new HttpError(404, 'Utilisateur introuvable.');
  }

  await insertLog({
    userId: actingUserId,
    action: 'role_changed',
    target: `${user.email} → ${role}`,
  });

  return user;
}
