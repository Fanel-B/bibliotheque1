import * as analyticsRepository from '../repositories/analytics.repository.js';
import { listAllUsers } from '../repositories/users.repository.js';
import { listRecentLogs } from '../repositories/logs.repository.js';

export const getOverview = analyticsRepository.getOverview;
export const getPopularBooks = analyticsRepository.getPopularBooks;
export const getPopularGenres = analyticsRepository.getPopularGenres;
export const getLoanTrends = analyticsRepository.getLoanTrends;
export const getUsers = listAllUsers;
export const getLogs = listRecentLogs;
