import { z } from 'zod';

export const setDeviceStateSchema = z.object({
  state: z.enum(['on', 'off'], { errorMap: () => ({ message: 'État invalide (on ou off).' }) }),
});

export const scenarioSchema = z.object({
  type: z.enum(
    ['open_archives', 'raise_temperature', 'increase_visitors', 'simulate_outage', 'toggle_light'],
    { errorMap: () => ({ message: 'Scénario inconnu.' }) }
  ),
});
