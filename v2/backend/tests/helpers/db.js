import { vi } from 'vitest';
import { pool } from '../../src/database/pool.js';
import { signAccessToken } from '../../src/utils/tokens.js';

// Associe un morceau de SQL à la réponse simulée. La première règle dont le
// motif apparaît dans la requête gagne. "rows" peut être une fonction
// (params) => rows, ou une Error à rejeter.
function repondre(regles, sql, params) {
  const regle = regles.find(([motif]) =>
    motif instanceof RegExp ? motif.test(sql) : sql.includes(motif)
  );
  if (!regle) {
    return Promise.reject(new Error(`Requête SQL non simulée : ${sql.trim().slice(0, 80)}`));
  }
  const reponse = regle[1];
  if (reponse instanceof Error) return Promise.reject(reponse);
  const rows = typeof reponse === 'function' ? reponse(params) : reponse;
  return Promise.resolve({ rows });
}

export function simulerRequetes(regles) {
  pool.query.mockImplementation((sql, params) => repondre(regles, sql, params));
}

// Faux client renvoyé par pool.connect(), pour les transactions.
export function simulerTransaction(regles) {
  const client = {
    query: vi.fn((sql, params) => {
      if (/^(BEGIN|COMMIT|ROLLBACK)$/.test(sql)) return Promise.resolve({ rows: [] });
      return repondre(regles, sql, params);
    }),
    release: vi.fn(),
  };
  pool.connect.mockResolvedValue(client);
  return client;
}

export function enteteAuth(utilisateur) {
  return `Bearer ${signAccessToken(utilisateur)}`;
}

export const lecteur = { id: 1, role: 'user' };
export const employe = { id: 2, role: 'employee' };
export const admin = { id: 3, role: 'admin' };
