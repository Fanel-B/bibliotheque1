import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { validate } from '../src/middleware/validate.js';
import { requireAuth, requireRole } from '../src/middleware/auth.middleware.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import { HttpError } from '../src/utils/HttpError.js';
import { signAccessToken } from '../src/utils/tokens.js';

function fausseReponse() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('validate', () => {
  const schema = z.object({ nom: z.string().trim().min(2, 'Nom trop court.'), age: z.number() });

  it('remplace req.body par les données nettoyées et appelle next()', () => {
    const req = { body: { nom: '  Léa ', age: 30, enTrop: true } };
    const next = vi.fn();
    validate(schema)(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ nom: 'Léa', age: 30 });
  });

  it('renvoie une HttpError 400 qui regroupe tous les messages', () => {
    const next = vi.fn();
    validate(schema)({ body: { nom: 'x', age: 'trente' } }, {}, next);
    const erreur = next.mock.calls[0][0];
    expect(erreur).toBeInstanceOf(HttpError);
    expect(erreur.statusCode).toBe(400);
    expect(erreur.message).toContain('Nom trop court.');
    expect(erreur.message).toContain(', ');
  });
});

describe('requireAuth', () => {
  it('refuse une requête sans en-tête Authorization (401)', () => {
    const next = vi.fn();
    requireAuth({ headers: {} }, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
    expect(next.mock.calls[0][0].message).toBe('Authentification requise.');
  });

  it('refuse un en-tête qui n’est pas de type Bearer', () => {
    const next = vi.fn();
    requireAuth({ headers: { authorization: 'Basic abc' } }, {}, next);
    expect(next.mock.calls[0][0].message).toBe('Authentification requise.');
  });

  it('refuse un token invalide ou expiré', () => {
    const expire = jwt.sign({ sub: 1, role: 'user' }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: -10,
    });
    for (const token of ['nimportequoi', expire]) {
      const next = vi.fn();
      requireAuth({ headers: { authorization: `Bearer ${token}` } }, {}, next);
      expect(next.mock.calls[0][0].message).toBe('Session invalide ou expirée.');
    }
  });

  it('accepte un token valide et renseigne req.user', () => {
    const req = { headers: { authorization: `Bearer ${signAccessToken({ id: 7, role: 'admin' })}` } };
    const next = vi.fn();
    requireAuth(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ id: 7, role: 'admin' });
  });
});

describe('requireRole', () => {
  it('laisse passer un rôle autorisé', () => {
    const next = vi.fn();
    requireRole('employee', 'admin')({ user: { id: 1, role: 'employee' } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('refuse un rôle non autorisé (403)', () => {
    const next = vi.fn();
    requireRole('admin')({ user: { id: 1, role: 'employee' } }, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it('refuse si aucun utilisateur n’est authentifié', () => {
    const next = vi.fn();
    requireRole('user')({}, {}, next);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});

describe('errorHandler', () => {
  it('renvoie le code et le message d’une HttpError', () => {
    const res = fausseReponse();
    errorHandler(new HttpError(409, 'Conflit.'), {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Conflit.' });
  });

  it('masque le détail d’une erreur inattendue (500)', () => {
    const espion = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = fausseReponse();
    errorHandler(new Error('détail interne sensible'), {}, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erreur interne du serveur.' });
    espion.mockRestore();
  });
});
