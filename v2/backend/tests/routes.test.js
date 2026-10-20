import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { app } from '../src/app.js';
import { isoDateInDays } from '../src/utils/dates.js';
import { verifyRefreshToken } from '../src/utils/tokens.js';
import {
  simulerRequetes,
  simulerTransaction,
  enteteAuth,
  lecteur,
  employe,
  admin,
} from './helpers/db.js';

afterEach(() => vi.restoreAllMocks());

describe('GET /api/health', () => {
  it('le serveur répond "up" sans toucher à la base', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'up' });
  });

  it('autorise l’origine du frontend configurée (CORS)', async () => {
    const res = await request(app).get('/api/health').set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('/db : "up" quand la base répond', async () => {
    simulerRequetes([['SELECT 1', [{ ok: 1 }]]]);
    const res = await request(app).get('/api/health/db');
    expect(res.body).toEqual({ status: 'up' });
  });

  it('/db : "down" (et toujours 200) quand la base est injoignable', async () => {
    simulerRequetes([['SELECT 1', new Error('connexion refusée')]]);
    const res = await request(app).get('/api/health/db');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'down', reason: 'connexion refusée' });
  });
});

describe('/api/books', () => {
  it('GET / : liste les livres avec compteurs numériques et transmet la recherche', async () => {
    simulerRequetes([['FROM books b', [{ id: 1, title: 'Dune', available_copies: '1', total_copies: '2' }]]]);
    const res = await request(app).get('/api/books?q=dune');
    expect(res.status).toBe(200);
    expect(res.body.books).toEqual([{ id: 1, title: 'Dune', available_copies: 1, total_copies: 2 }]);
  });

  it('GET /:id : 400 pour un identifiant non numérique', async () => {
    const res = await request(app).get('/api/books/abc');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Identifiant de livre invalide.');
  });

  it('GET /:id : 404 pour un livre inconnu', async () => {
    simulerRequetes([['FROM books b', []]]);
    const res = await request(app).get('/api/books/999');
    expect(res.status).toBe(404);
  });

  it('GET /:id : renvoie le livre et ses exemplaires', async () => {
    simulerRequetes([
      ['FROM books b', [{ id: 1, title: 'Dune' }]],
      ['FROM copies', [{ id: 10, state: 'bon', available: true }]],
    ]);
    const res = await request(app).get('/api/books/1');
    expect(res.status).toBe(200);
    expect(res.body.book.copies).toHaveLength(1);
  });

  it('500 générique si la base plante, sans fuite du message interne', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    simulerRequetes([['FROM books b', new Error('détail interne')]]);
    const res = await request(app).get('/api/books');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Erreur interne du serveur.' });
  });
});

describe('/api/auth', () => {
  it('POST /register : 400 avec les messages zod pour un corps invalide', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'A', email: 'pas-un-email', password: 'court' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Adresse email invalide.');
    expect(res.body.error).toContain('Le mot de passe doit faire au moins 8 caractères.');
  });

  it('POST /register : 201 et jamais de hash dans la réponse', async () => {
    simulerRequetes([
      ['WHERE u.email', []],
      ['INSERT INTO users', ([name, email]) => [{ id: 5, name, email }]],
    ]);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Nouveau', email: 'nouveau@exemple.test', password: 'motdepasse' });
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: 5, name: 'Nouveau', email: 'nouveau@exemple.test', role: 'user' });
    expect(JSON.stringify(res.body)).not.toContain('password');
  });

  it('POST /register : 409 si l’email existe déjà', async () => {
    simulerRequetes([['WHERE u.email', [{ id: 1 }]]]);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Doublon', email: 'existe@exemple.test', password: 'motdepasse' });
    expect(res.status).toBe(409);
  });

  it('POST /login : pose le cookie de rafraîchissement HttpOnly limité à /api/auth', async () => {
    const hash = await bcrypt.hash('motdepasse', 4);
    simulerRequetes([
      ['WHERE u.email', [{ id: 9, name: 'Alice', email: 'a@exemple.test', role: 'user', password_hash: hash }]],
    ]);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@exemple.test', password: 'motdepasse' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).not.toHaveProperty('password_hash');
    const cookie = res.headers['set-cookie'][0];
    expect(cookie).toMatch(/^refreshToken=/);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/api/auth');
    const jeton = decodeURIComponent(cookie.split(';')[0].split('=')[1]);
    expect(verifyRefreshToken(jeton).sub).toBe(9);
  });

  it('POST /login : 401 pour un mauvais mot de passe', async () => {
    const hash = await bcrypt.hash('motdepasse', 4);
    simulerRequetes([['WHERE u.email', [{ id: 9, role: 'user', password_hash: hash }]]]);
    const res = await request(app).post('/api/auth/login').send({ email: 'a@exemple.test', password: 'faux' });
    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('POST /refresh : 401 sans cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });

  it('POST /logout : 204 et efface le cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(204);
    expect(res.headers['set-cookie'][0]).toMatch(/^refreshToken=;/);
  });

  it('GET /me : 401 sans token, profil sans hash avec token', async () => {
    expect((await request(app).get('/api/auth/me')).status).toBe(401);

    simulerRequetes([['WHERE u.id', [{ id: 1, name: 'Lecteur', role: 'user', password_hash: 'secret' }]]]);
    const res = await request(app).get('/api/auth/me').set('Authorization', enteteAuth(lecteur));
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 1, name: 'Lecteur', role: 'user' });
  });
});

describe('/api/loans', () => {
  it('GET /me : 401 avec un token invalide', async () => {
    const res = await request(app).get('/api/loans/me').set('Authorization', 'Bearer faux.token.jwt');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Session invalide ou expirée.');
  });

  it('GET /me : emprunts de l’utilisateur connecté avec statut (dont retard)', async () => {
    simulerRequetes([
      [
        'WHERE l.user_id',
        (params) => {
          expect(params).toEqual([lecteur.id]);
          return [
            { id: 1, due_date: isoDateInDays(-3), return_date: null },
            { id: 2, due_date: isoDateInDays(7), return_date: null },
          ];
        },
      ],
    ]);
    const res = await request(app).get('/api/loans/me').set('Authorization', enteteAuth(lecteur));
    expect(res.status).toBe(200);
    expect(res.body.loans.map((l) => l.status)).toEqual(['retard', 'en_cours']);
  });

  it('POST / : 403 pour un simple lecteur', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', enteteAuth(lecteur))
      .send({ userEmail: 'a@exemple.test', copyId: 1 });
    expect(res.status).toBe(403);
  });

  it('POST / : 400 si le corps est invalide (validation avant tout accès base)', async () => {
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', enteteAuth(employe))
      .send({ userEmail: 'a@exemple.test', copyId: 'trois' });
    expect(res.status).toBe(400);
  });

  it('POST / : 201 pour un employé, échéance à J+14', async () => {
    simulerRequetes([
      ['WHERE u.email', [{ id: 1, email: 'a@exemple.test' }]],
      ['INSERT INTO logs', []],
    ]);
    const client = simulerTransaction([
      ['FOR UPDATE', [{ id: 3, available: true }]],
      ['UPDATE copies', []],
      ['INSERT INTO loans', ([, , dueDate]) => [{ id: 50, due_date: dueDate }]],
    ]);

    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', enteteAuth(employe))
      .send({ userEmail: 'a@exemple.test', copyId: 3 });

    expect(res.status).toBe(201);
    expect(res.body.loan).toEqual({ id: 50, due_date: isoDateInDays(14) });
    expect(client.release).toHaveBeenCalled();
  });

  it('POST / : 409 si l’exemplaire est déjà emprunté', async () => {
    simulerRequetes([['WHERE u.email', [{ id: 1 }]]]);
    simulerTransaction([['FOR UPDATE', [{ id: 3, available: false }]]]);
    const res = await request(app)
      .post('/api/loans')
      .set('Authorization', enteteAuth(employe))
      .send({ userEmail: 'a@exemple.test', copyId: 3 });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Cet exemplaire est déjà emprunté.');
  });

  it('GET /overdue : réservé à l’admin', async () => {
    const refus = await request(app).get('/api/loans/overdue').set('Authorization', enteteAuth(employe));
    expect(refus.status).toBe(403);

    simulerRequetes([['due_date < CURRENT_DATE', [{ id: 1, title: 'Dune' }]]]);
    const res = await request(app).get('/api/loans/overdue').set('Authorization', enteteAuth(admin));
    expect(res.status).toBe(200);
    expect(res.body.loans).toEqual([{ id: 1, title: 'Dune' }]);
  });

  it('PATCH /:copyId/return : 400 pour un identifiant invalide, 404 si non emprunté', async () => {
    const invalide = await request(app).patch('/api/loans/abc/return').set('Authorization', enteteAuth(employe));
    expect(invalide.status).toBe(400);

    simulerTransaction([['FOR UPDATE', []]]);
    const res = await request(app).patch('/api/loans/3/return').set('Authorization', enteteAuth(employe));
    expect(res.status).toBe(404);
  });
});

describe('/api/reservations', () => {
  const corps = () => ({ roomId: 2, date: isoDateInDays(1), startTime: '10:00', endTime: '11:00' });

  it('POST / : 401 sans authentification', async () => {
    const res = await request(app).post('/api/reservations').send(corps());
    expect(res.status).toBe(401);
  });

  it('POST / : 400 si l’heure de fin précède le début', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', enteteAuth(lecteur))
      .send({ ...corps(), startTime: '12:00', endTime: '11:00' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("L'heure de fin doit être après l'heure de début.");
  });

  it('POST / : 409 si le créneau est déjà pris', async () => {
    simulerRequetes([['FROM rooms', [{ id: 2 }]]]);
    simulerTransaction([
      ['pg_advisory_xact_lock', []],
      ['FROM reservations', [{ id: 1 }]],
    ]);
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', enteteAuth(lecteur))
      .send(corps());
    expect(res.status).toBe(409);
  });

  it('POST / : 201 et la réservation est rattachée à l’utilisateur du token', async () => {
    simulerRequetes([['FROM rooms', [{ id: 2 }]]]);
    simulerTransaction([
      ['pg_advisory_xact_lock', []],
      ['FROM reservations', []],
      ['INSERT INTO reservations', ([userId, roomId]) => [{ id: 7, user_id: userId, room_id: roomId }]],
    ]);
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', enteteAuth(lecteur))
      .send({ ...corps(), userId: 999 });
    expect(res.status).toBe(201);
    expect(res.body.reservation).toEqual({ id: 7, user_id: lecteur.id, room_id: 2 });
  });

  it('DELETE /:id : 204 si supprimée, 404 sinon', async () => {
    simulerRequetes([['DELETE FROM reservations', [{ id: 7 }]]]);
    const ok = await request(app).delete('/api/reservations/7').set('Authorization', enteteAuth(lecteur));
    expect(ok.status).toBe(204);

    simulerRequetes([['DELETE FROM reservations', []]]);
    const absent = await request(app).delete('/api/reservations/7').set('Authorization', enteteAuth(lecteur));
    expect(absent.status).toBe(404);
  });
});

describe('GET /api/recommendations/me', () => {
  it('renvoie les recommandations avec des scores numériques', async () => {
    simulerRequetes([
      [
        'already_borrowed',
        [{ id: 4, title: 'Fondation', genre_score: '3', author_score: '0', popularity_score: '2', score: '8' }],
      ],
    ]);
    const res = await request(app).get('/api/recommendations/me').set('Authorization', enteteAuth(lecteur));
    expect(res.status).toBe(200);
    expect(res.body.books[0]).toMatchObject({ score: 8, genre_score: 3, popularity_score: 2 });
  });
});

describe('/api/admin', () => {
  it('403 pour un employé', async () => {
    const res = await request(app).get('/api/admin/users').set('Authorization', enteteAuth(employe));
    expect(res.status).toBe(403);
  });

  it('export CSV des utilisateurs : en-têtes HTTP et dates au format AAAA-MM-JJ', async () => {
    simulerRequetes([
      [
        'FROM users u',
        [{ id: 1, name: 'Dupont, Jean', email: 'j@exemple.test', role: 'user', created_at: new Date('2026-01-15T10:00:00Z') }],
      ],
    ]);
    const res = await request(app).get('/api/admin/export/users.csv').set('Authorization', enteteAuth(admin));
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(res.headers['content-disposition']).toBe('attachment; filename="utilisateurs.csv"');
    expect(res.text).toBe('id,nom,email,role,inscrit_le\n1,"Dupont, Jean",j@exemple.test,user,2026-01-15');
  });

  it('PATCH /users/:id/role : un admin ne peut pas changer son propre rôle', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${admin.id}/role`)
      .set('Authorization', enteteAuth(admin))
      .send({ role: 'user' });
    expect(res.status).toBe(400);
  });

  it('PATCH /users/:id/role : 400 pour un rôle inconnu', async () => {
    const res = await request(app)
      .patch('/api/admin/users/8/role')
      .set('Authorization', enteteAuth(admin))
      .send({ role: 'superadmin' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Rôle invalide.');
  });

  it('PATCH /users/:id/role : change le rôle d’un autre utilisateur', async () => {
    simulerRequetes([
      ['UPDATE users', [{ id: 8, name: 'B', email: 'b@exemple.test' }]],
      ['INSERT INTO logs', []],
    ]);
    const res = await request(app)
      .patch('/api/admin/users/8/role')
      .set('Authorization', enteteAuth(admin))
      .send({ role: 'employee' });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 8, name: 'B', email: 'b@exemple.test', role: 'employee' });
  });
});

describe('/api/iot', () => {
  it('PATCH /devices/:id : 403 pour un employé (pilotage réservé à l’admin)', async () => {
    const res = await request(app)
      .patch('/api/iot/devices/1')
      .set('Authorization', enteteAuth(employe))
      .send({ state: 'on' });
    expect(res.status).toBe(403);
  });

  it('PATCH /devices/:id : 403 pour un dispositif non contrôlable', async () => {
    simulerRequetes([['FROM iot_devices WHERE id', [{ id: 1, controllable: false }]]]);
    const res = await request(app)
      .patch('/api/iot/devices/1')
      .set('Authorization', enteteAuth(admin))
      .send({ state: 'on' });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Ce dispositif n'est pas contrôlable à distance.");
  });

  it('POST /simulator/scenario : 400 pour un scénario inconnu', async () => {
    const res = await request(app)
      .post('/api/iot/simulator/scenario')
      .set('Authorization', enteteAuth(admin))
      .send({ type: 'inconnu' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Scénario inconnu.');
  });

  it('GET /sensors/:id/history : 400 pour une plage invalide', async () => {
    const res = await request(app)
      .get('/api/iot/sensors/1/history?range=1an')
      .set('Authorization', enteteAuth(employe));
    expect(res.status).toBe(400);
  });
});

describe('/api/automations', () => {
  it('PATCH /:id : 404 pour une automatisation inconnue', async () => {
    simulerRequetes([['UPDATE automations', []]]);
    const res = await request(app)
      .patch('/api/automations/99')
      .set('Authorization', enteteAuth(admin))
      .send({ enabled: true });
    expect(res.status).toBe(404);
  });

  it('PATCH /:id : 400 si "enabled" n’est pas un booléen', async () => {
    const res = await request(app)
      .patch('/api/automations/1')
      .set('Authorization', enteteAuth(admin))
      .send({ enabled: 'oui' });
    expect(res.status).toBe(400);
  });
});
