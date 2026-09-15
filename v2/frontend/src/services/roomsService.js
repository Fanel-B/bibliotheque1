import { apiClient } from '../lib/apiClient';

export function listRooms(date) {
  const params = date ? `?date=${encodeURIComponent(date)}` : '';
  return apiClient(`/api/rooms${params}`);
}
