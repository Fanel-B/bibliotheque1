import rateLimit from 'express-rate-limit';

// Limite les tentatives sur la connexion et l'inscription : 10 requêtes
// par tranche de 15 minutes et par adresse IP. Au-delà, l'API répond 429
// (Too Many Requests). Cela rend une attaque par force brute (essayer des
// milliers de mots de passe à la suite) beaucoup trop lente pour réussir.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // En-têtes standard "RateLimit" pour que le client sache où il en est.
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Même format que les autres erreurs de l'API : { error: "..." }.
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});
