import * as adminService from '../services/admin.service.js';

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
