import { z } from 'zod';

export const setEnabledSchema = z.object({
  enabled: z.boolean(),
});
