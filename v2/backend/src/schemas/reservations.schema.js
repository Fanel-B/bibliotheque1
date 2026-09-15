import { z } from 'zod';
import { isoDateInDays } from '../utils/dates.js';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const createReservationSchema = z
  .object({
    roomId: z.number().int().positive('Salle invalide.'),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format AAAA-MM-JJ).'),
    startTime: z.string().regex(timePattern, 'Heure de début invalide.'),
    endTime: z.string().regex(timePattern, 'Heure de fin invalide.'),
  })
  .refine((data) => data.date >= isoDateInDays(0), {
    message: "La date doit être aujourd'hui ou dans le futur.",
    path: ['date'],
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "L'heure de fin doit être après l'heure de début.",
    path: ['endTime'],
  });
