import request from 'supertest';
import { app } from '../src/app.js';

// Comptes de démonstration créés par src/database/seed.js.
export const DEMO_PASSWORD = 'demo1234';
export const USER_EMAIL = 'claire@bibliotech.demo'; // rôle "user"
export const EMPLOYEE_EMAIL = 'hugo@bibliotech.demo'; // rôle "employee"

// Se connecte et renvoie le jeton d'accès, à mettre ensuite dans
// l'en-tête "Authorization: Bearer <jeton>".
export async function loginAs(email) {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: DEMO_PASSWORD });
  return res.body.accessToken;
}
