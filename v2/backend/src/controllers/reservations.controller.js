import * as reservationsService from '../services/reservations.service.js';
import { HttpError } from '../utils/HttpError.js';

export async function create(req, res) {
  const reservation = await reservationsService.createReservation({
    userId: req.user.id,
    ...req.body,
  });
  res.status(201).json({ reservation });
}

export async function remove(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new HttpError(400, 'Identifiant de réservation invalide.');
  }
  await reservationsService.cancelReservation(id, req.user.id);
  res.status(204).send();
}

export async function myReservations(req, res) {
  const reservations = await reservationsService.listMyReservations(req.user.id);
  res.json({ reservations });
}
