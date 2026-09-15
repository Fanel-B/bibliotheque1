import { HttpError } from '../utils/HttpError.js';

// Middleware à 4 arguments = Express le reconnaît comme gestionnaire d'erreurs.
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error(err);
  res.status(500).json({ error: 'Erreur interne du serveur.' });
}
