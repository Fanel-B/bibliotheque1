import { apiClient } from '../lib/apiClient';

export function getOverview(accessToken) {
  return apiClient('/api/admin/analytics/overview', { accessToken });
}

export function getPopularBooks(accessToken) {
  return apiClient('/api/admin/analytics/popular-books', { accessToken });
}

export function getPopularGenres(accessToken) {
  return apiClient('/api/admin/analytics/popular-genres', { accessToken });
}

export function getTrends(accessToken) {
  return apiClient('/api/admin/analytics/trends', { accessToken });
}

export function getUsers(accessToken) {
  return apiClient('/api/admin/users', { accessToken });
}

export function getLogs(accessToken) {
  return apiClient('/api/admin/logs', { accessToken });
}
