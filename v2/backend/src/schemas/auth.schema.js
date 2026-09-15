import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Le nom doit faire au moins 2 caractères.'),
  email: z.string().trim().email('Adresse email invalide.'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères.'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Adresse email invalide.'),
  password: z.string().min(1, 'Mot de passe requis.'),
});
