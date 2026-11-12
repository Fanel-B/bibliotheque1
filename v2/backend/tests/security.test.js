import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/database/pool.js';
import { USER_EMAIL, DEMO_PASSWORD } from './helpers.js';

// Chaque fichier de test charge sa propre copie de l'app : le compteur de
// tentatives de connexion repart donc de zéro ici.

afterAll(async () => {
  await pool.end();
});

describe('Sécurité HTTP', () => {
  it('helmet ajoute les en-têtes de sécurité', async () => {
    const res = await request(app).get('/api/health');

    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    // Express ne doit plus annoncer qu'il est Express.
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('la déconnexion efface bien le cookie de rafraîchissement', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: DEMO_PASSWORD });
    expect(login.status).toBe(200);

    const res = await request(app).post('/api/auth/logout');

    expect(res.status).toBe(204);
    const cookie = res.headers['set-cookie'].join(';');
    // Cookie vide, expiré en 1970, sur le même chemin qu'à sa création.
    expect(cookie).toMatch(/refreshToken=;/);
    expect(cookie).toMatch(/Expires=Thu, 01 Jan 1970/);
    expect(cookie).toMatch(/Path=\/api\/auth/);
  });

  it('la 11e tentative de connexion en 15 minutes renvoie 429', async () => {
    // Le test précédent a déjà fait 1 connexion : il en reste 9 autorisées.
    for (let i = 0; i < 9; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: USER_EMAIL, password: 'mauvais-mot-de-passe' });
      expect(res.status).toBe(401);
    }

    const blocked = await request(app)
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: DEMO_PASSWORD });

    // Bloqué même avec le bon mot de passe : la limite passe avant tout.
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe('Trop de tentatives. Réessayez dans 15 minutes.');
  });
});
