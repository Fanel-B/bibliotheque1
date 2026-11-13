import { z } from 'zod';

// Les emails sont nettoyés (espaces) et mis en minuscules avant tout
// traitement : un compte s'identifie de la même façon quelle que soit
// la casse tapée.

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit faire au moins 2 caractères.'),
  email: z.string().trim().toLowerCase().email('Adresse email invalide.'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères.'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse email invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});
