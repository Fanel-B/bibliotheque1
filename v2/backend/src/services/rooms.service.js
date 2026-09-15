import * as roomsRepository from '../repositories/rooms.repository.js';

export function listRooms(date) {
  return roomsRepository.listRoomsWithAvailability(date);
}
