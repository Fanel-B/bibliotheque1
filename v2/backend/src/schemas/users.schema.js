import { z } from 'zod';

export const setRoleSchema = z.object({
  role: z.enum(['user', 'employee', 'admin'], {
    errorMap: () => ({ message: 'Rôle invalide.' }),
  }),
});
