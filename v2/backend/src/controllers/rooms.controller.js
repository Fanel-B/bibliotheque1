import * as roomsService from '../services/rooms.service.js';

export async function listRooms(req, res) {
  const rooms = await roomsService.listRooms(req.query.date);
  res.json({ rooms });
}
