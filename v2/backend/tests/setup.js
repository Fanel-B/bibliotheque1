import { vi, beforeEach } from 'vitest';

// Le pool PostgreSQL est simulé pour TOUS les fichiers de test : aucun test
// ne peut ouvrir une vraie connexion. Une requête qu'un test n'a pas prévue
// échoue explicitement plutôt que de partir vers une base.
vi.mock('../src/database/pool.js', () => ({
  pool: {
    query: vi.fn(),
    connect: vi.fn(),
    on: vi.fn(),
  },
}));

const { pool } = await import('../src/database/pool.js');

beforeEach(() => {
  pool.query.mockReset();
  pool.connect.mockReset();
  pool.query.mockImplementation((sql) =>
    Promise.reject(new Error(`Requête SQL non simulée dans ce test : ${String(sql).trim().slice(0, 80)}`))
  );
  pool.connect.mockImplementation(() =>
    Promise.reject(new Error('Connexion au pool non simulée dans ce test.'))
  );
});
