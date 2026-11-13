import rateLimit from 'express-rate-limit';

// Freine les attaques par force brute (essayer des milliers de mots de
// passe à la suite) sur la connexion et l'inscription : au-delà de 10
// ÉCHECS en 15 minutes pour un même couple adresse IP + email, l'API
// répond 429 (Too Many Requests).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // Seuls les échecs comptent : un utilisateur qui se connecte normalement
  // n'est jamais bloqué, même s'il se connecte souvent.
  skipSuccessfulRequests: true,
  // Compteur par IP ET par email. Derrière l'hébergeur, plusieurs visiteurs
  // peuvent apparaître avec la même IP (celle d'un proxy) : sans l'email,
  // ils partageraient un seul compteur et se bloqueraient entre eux.
  keyGenerator: (req) => `${req.ip}|${req.body?.email ?? ''}`,
  // En-têtes standard "RateLimit" pour que le client sache où il en est.
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Même format que les autres erreurs de l'API : { error: "..." }.
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});
