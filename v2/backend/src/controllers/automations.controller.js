import * as automationsService from '../services/automations.service.js';
import { HttpError } from '../utils/HttpError.js';

export async function list(req, res) {
  res.json({ automations: await automationsService.listAutomations() });
}

export async function setEnabled(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new HttpError(400, "Identifiant d'automatisation invalide.");
  }
  const automation = await automationsService.setEnabled(id, req.body.enabled);
  if (!automation) {
    throw new HttpError(404, 'Automatisation introuvable.');
  }
  res.json({ automation });
}

export async function logs(req, res) {
  res.json({ logs: await automationsService.listLogs() });
}
