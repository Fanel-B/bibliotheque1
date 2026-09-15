import { apiClient } from '../lib/apiClient';

export function myRecommendations(accessToken) {
  return apiClient('/api/recommendations/me', { accessToken });
}
