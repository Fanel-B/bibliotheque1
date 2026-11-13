import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/database/pool.js';
import { DEMO_PASSWORD, USER_EMAIL, loginAs } from './helpers.js';

// Tests d'intégration : on passe par la vraie chaîne
// route -> middleware -> contrôleur -> service -> repository -> PostgreSQL.
// supertest envoie des requêtes HTTP à "app" sans ouvrir de port.

afterAll(async () => {
  // On ferme les connexions à la base pour que Vitest se termine proprement.
  await pool.end();
});

describe('Authentification', () => {
  it('connexion avec le bon mot de passe : 200 et un jeton d’accès', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: DEMO_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(USER_EMAIL);
    // Le mot de passe haché ne doit jamais sortir de l'API.
    expect(res.body.user.password_hash).toBeUndefined();
    // Le jeton de rafraîchissement part dans un cookie httpOnly.
    expect(res.headers['set-cookie'].join(';')).toMatch(/refreshToken=.*HttpOnly/);
  });

  it('connexion avec un mauvais mot de passe : 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: 'mauvais-mot-de-passe' });

    expect(res.status).toBe(401);
    expect(res.body.accessToken).toBeUndefined();
  });

  it('route protégée sans jeton : 401', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
  });

  it('route employé appelée par un simple usager : 403', async () => {
    const token = await loginAs(USER_EMAIL);

    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', `Bearer ${token}`)
      .send({ userEmail: USER_EMAIL, copyId: 7 });

    expect(res.status).toBe(403);
  });
});
