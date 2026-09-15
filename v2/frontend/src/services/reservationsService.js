import { apiClient } from '../lib/apiClient';

export function myReservations(accessToken) {
  return apiClient('/api/reservations/me', { accessToken });
}

export function createReservation(accessToken, { roomId, date, startTime, endTime }) {
  return apiClient('/api/reservations', {
    method: 'POST',
    accessToken,
    body: { roomId, date, startTime, endTime },
  });
}

export function cancelReservation(accessToken, id) {
  return apiClient(`/api/reservations/${id}`, { method: 'DELETE', accessToken });
}
