import { describe, it, expect, vi, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { toCSV } from '../src/utils/csv.js';
import { isoDateInDays } from '../src/utils/dates.js';
import { HttpError } from '../src/utils/HttpError.js';
import { asyncHandler } from '../src/utils/asyncHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshCookieOptions,
  REFRESH_COOKIE_MAX_AGE_MS,
} from '../src/utils/tokens.js';

describe('toCSV', () => {
  const colonnes = [
    { key: 'id', label: 'id' },
    { key: 'nom', label: 'nom' },
  ];

  it('produit un en-tête puis une ligne par enregistrement', () => {
    const csv = toCSV([{ id: 1, nom: 'Alice' }, { id: 2, nom: 'Bob' }], colonnes);
    expect(csv).toBe('id,nom\n1,Alice\n2,Bob');
  });

  it('échappe les virgules, guillemets et retours à la ligne', () => {
    const csv = toCSV([{ id: 1, nom: 'Dupont, "Jean"\nfils' }], colonnes);
    expect(csv).toBe('id,nom\n1,"Dupont, ""Jean""\nfils"');
  });

  it('remplace null et undefined par une cellule vide', () => {
    const csv = toCSV([{ id: null }], colonnes);
    expect(csv).toBe('id,nom\n,');
  });

  it('ne renvoie que l’en-tête quand il n’y a aucune ligne', () => {
    expect(toCSV([], colonnes)).toBe('id,nom');
  });
});

describe('isoDateInDays', () => {
  afterEach(() => vi.useRealTimers());

  it('renvoie la date du jour au format AAAA-MM-JJ', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-03-10T12:00:00Z'));
    expect(isoDateInDays()).toBe('2026-03-10');
  });

  it('gère le passage de mois et d’année', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-12-25T12:00:00Z'));
    expect(isoDateInDays(14)).toBe('2027-01-08');
    expect(isoDateInDays(-25)).toBe('2026-11-30');
  });
});

describe('HttpError', () => {
  it('porte le code HTTP et le message', () => {
    const erreur = new HttpError(404, 'Introuvable.');
    expect(erreur).toBeInstanceOf(Error);
    expect(erreur.statusCode).toBe(404);
    expect(erreur.message).toBe('Introuvable.');
  });
});

describe('asyncHandler', () => {
  it('transmet à next() l’erreur d’une fonction async', async () => {
    const erreur = new Error('boum');
    const next = vi.fn();
    asyncHandler(async () => {
      throw erreur;
    })({}, {}, next);
    await vi.waitFor(() => expect(next).toHaveBeenCalledWith(erreur));
  });

  it('n’appelle pas next() quand la fonction réussit', async () => {
    const next = vi.fn();
    const fn = vi.fn().mockResolvedValue(undefined);
    asyncHandler(fn)({ a: 1 }, {}, next);
    await Promise.resolve();
    expect(fn).toHaveBeenCalledWith({ a: 1 }, {}, next);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('tokens JWT', () => {
  const utilisateur = { id: 42, role: 'employee' };

  it('le token d’accès contient l’id et le rôle', () => {
    const payload = verifyAccessToken(signAccessToken(utilisateur));
    expect(payload.sub).toBe(42);
    expect(payload.role).toBe('employee');
    expect(payload.exp - payload.iat).toBe(30 * 60);
  });

  it('le token de rafraîchissement ne contient pas le rôle et dure 7 jours', () => {
    const payload = verifyRefreshToken(signRefreshToken(utilisateur));
    expect(payload.sub).toBe(42);
    expect(payload.role).toBeUndefined();
    expect(payload.exp - payload.iat).toBe(7 * 24 * 3600);
  });

  it('un token de rafraîchissement n’est pas accepté comme token d’accès', () => {
    expect(() => verifyAccessToken(signRefreshToken(utilisateur))).toThrow();
  });

  it('rejette un token signé avec un autre secret', () => {
    const faux = jwt.sign({ sub: 1, role: 'admin' }, 'pas-le-bon-secret');
    expect(() => verifyAccessToken(faux)).toThrow();
  });
});

describe('refreshCookieOptions', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('en local : cookie non sécurisé, SameSite=lax', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(refreshCookieOptions()).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
      path: '/api/auth',
    });
  });

  it('en production : cookie sécurisé, SameSite=none', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const options = refreshCookieOptions();
    expect(options.secure).toBe(true);
    expect(options.sameSite).toBe('none');
  });
});
