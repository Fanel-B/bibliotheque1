import * as adminService from '../services/admin.service.js';
import { HttpError } from '../utils/HttpError.js';
import { toCSV } from '../utils/csv.js';

function sendCSV(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

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

export async function exportUsers(req, res) {
  const rows = await adminService.getUsers();
  // created_at revient comme un objet Date depuis pg — String(date) donnerait
  // un format JS verbeux avec fuseau horaire, illisible dans un tableur.
  const formatted = rows.map((row) => ({
    ...row,
    created_at: new Date(row.created_at).toISOString().slice(0, 10),
  }));
  const csv = toCSV(formatted, [
    { key: 'id', label: 'id' },
    { key: 'name', label: 'nom' },
    { key: 'email', label: 'email' },
    { key: 'role', label: 'role' },
    { key: 'created_at', label: 'inscrit_le' },
  ]);
  sendCSV(res, 'utilisateurs.csv', csv);
}

export async function exportLoans(req, res) {
  const rows = await adminService.getAllLoans();
  const csv = toCSV(rows, [
    { key: 'id', label: 'id' },
    { key: 'user_name', label: 'emprunteur' },
    { key: 'email', label: 'email' },
    { key: 'title', label: 'livre' },
    { key: 'loan_date', label: 'date_emprunt' },
    { key: 'due_date', label: 'date_retour_prevue' },
    { key: 'return_date', label: 'date_retour_reelle' },
  ]);
  sendCSV(res, 'prets.csv', csv);
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
