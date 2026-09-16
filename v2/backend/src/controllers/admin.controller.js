import * as adminService from '../services/admin.service.js';
import { HttpError } from '../utils/HttpError.js';

export async function overview(req, res) {
  res.json(await adminService.getOverview());
}

export async function popularBooks(req, res) {
  res.json({ books: await adminService.getPopularBooks() });
}

export async function popularGenres(req, res) {
  res.json({ genres: await adminService.getPopularGenres() });
}

export async function trends(req, res) {
  res.json({ trends: await adminService.getLoanTrends() });
}

export async function users(req, res) {
  res.json({ users: await adminService.getUsers() });
}

export async function logs(req, res) {
  res.json({ logs: await adminService.getLogs() });
}

export async function changeUserRole(req, res) {
  const targetUserId = Number(req.params.id);
  if (!Number.isInteger(targetUserId)) {
    throw new HttpError(400, "Identifiant d'utilisateur invalide.");
  }
  const user = await adminService.changeUserRole({
    targetUserId,
    role: req.body.role,
    actingUserId: req.user.id,
  });
  res.json({ user });
}
