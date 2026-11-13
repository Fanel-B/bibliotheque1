import { z } from 'zod';

export const createLoanSchema = z.object({
  userEmail: z.string().trim().toLowerCase().email('Adresse email invalide.'),
  copyId: z.number().int().positive('Identifiant d’exemplaire invalide.'),
});
