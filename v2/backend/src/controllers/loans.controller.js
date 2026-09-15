import * as loansService from '../services/loans.service.js';
import { HttpError } from '../utils/HttpError.js';

export async function create(req, res) {
  const loan = await loansService.createLoan({ ...req.body, actingUserId: req.user.id });
  res.status(201).json({ loan });
}

export async function returnByCopy(req, res) {
  const copyId = Number(req.params.copyId);
  if (!Number.isInteger(copyId)) {
    throw new HttpError(400, "Identifiant d'exemplaire invalide.");
  }
  const loan = await loansService.returnLoan(copyId, req.user.id);
  res.json({ loan });
}

export async function myLoans(req, res) {
  const loans = await loansService.listMyLoans(req.user.id);
  res.json({ loans });
}

export async function overdue(req, res) {
  const loans = await loansService.listOverdueLoans();
  res.json({ loans });
}
