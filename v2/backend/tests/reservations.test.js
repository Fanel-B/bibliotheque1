import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/database/pool.js';
import { USER_EMAIL, loginAs } from './helpers.js';

let userToken;

beforeAll(async () => {
  userToken = await loginAs(USER_EMAIL);
});

afterAll(async () => {
  await pool.end();
});

describe('Réservations', () => {
  it('réservation avec des données invalides : 400 renvoyé par Zod', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${userToken}`)
      // Salle négative, date mal formée, heure de fin avant l'heure de début.
      .send({ roomId: -1, date: '13/11/2026', startTime: '14:00', endTime: '10:00' });

    expect(res.status).toBe(400);
    // Le middleware validate() renvoie les messages d'erreur de Zod.
    expect(res.body.error).toMatch(/Salle invalide/);
    expect(res.body.error).toMatch(/Date invalide/);
  });
});
