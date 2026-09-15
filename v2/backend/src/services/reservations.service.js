import { HttpError } from '../utils/HttpError.js';
import * as reservationsRepository from '../repositories/reservations.repository.js';

export async function createReservation({ userId, roomId, date, startTime, endTime }) {
  try {
    return await reservationsRepository.createReservation({
      userId,
      roomId,
      date,
      startTime,
      endTime,
    });
  } catch (error) {
    if (error.message === 'ROOM_NOT_FOUND') {
      throw new HttpError(404, 'Salle introuvable.');
    }
    if (error.message === 'SLOT_TAKEN') {
      throw new HttpError(409, 'Ce créneau est déjà réservé pour cette salle.');
    }
    throw error;
  }
}

export async function cancelReservation(id, userId) {
  const deleted = await reservationsRepository.deleteReservation(id, userId);
  if (!deleted) {
    throw new HttpError(404, 'Réservation introuvable.');
  }
  return deleted;
}

export function listMyReservations(userId) {
  return reservationsRepository.listReservationsByUser(userId);
}
