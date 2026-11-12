import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { pool } from '../src/database/pool.js';
import { createLoan } from '../src/repositories/loans.repository.js';
import { USER_EMAIL, EMPLOYEE_EMAIL, loginAs } from './helpers.js';

let employeeToken;

beforeAll(async () => {
  // Seuls les employés (et admins) peuvent enregistrer un emprunt.
  employeeToken = await loginAs(EMPLOYEE_EMAIL);
});

afterAll(async () => {
  await pool.end();
});

// Petit raccourci : un employé prête l'exemplaire copyId à Claire.
function lendCopy(copyId) {
  return request(app)
    .post('/api/loans')
    .set('Authorization', `Bearer ${employeeToken}`)
    .send({ userEmail: USER_EMAIL, copyId });
}

// Nombre de prêts en cours (non rendus) sur un exemplaire, lu en base.
async function countOpenLoans(copyId) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS n FROM loans WHERE copy_id = $1 AND return_date IS NULL',
    [copyId]
  );
  return rows[0].n;
}

describe('Emprunts', () => {
  it('emprunt d’un exemplaire disponible : 201', async () => {
    // L'exemplaire 7 est disponible dans les données de démonstration.
    const res = await lendCopy(7);

    expect(res.status).toBe(201);
    expect(res.body.loan.copy_id).toBe(7);
    expect(res.body.loan.return_date).toBeNull();
  });

  it('second emprunt du même exemplaire : 409', async () => {
    // L'exemplaire 7 vient d'être prêté au test précédent.
    const res = await lendCopy(7);

    expect(res.status).toBe(409);
  });

  it('emprunts simultanés via l’API : un seul 201, les autres 409', async () => {
    // Promise.all lance les 10 requêtes HTTP en même temps, sans attendre
    // la première. On vérifie le comportement vu par le client.
    const responses = await Promise.all(
      Array.from({ length: 10 }, () => lendCopy(9))
    );

    const statuses = responses.map((res) => res.status);
    expect(statuses.filter((s) => s === 201)).toHaveLength(1);
    expect(statuses.filter((s) => s === 409)).toHaveLength(9);
    expect(await countOpenLoans(9)).toBe(1);
  });

  it('emprunts simultanés dans le repository : le verrou FOR UPDATE empêche le double prêt', async () => {
    // Même scénario, mais en appelant directement la fonction qui contient
    // la transaction. Sans le passage HTTP, les transactions démarrent
    // vraiment ensemble : si on retire "FOR UPDATE" du SELECT, plusieurs
    // transactions lisent "disponible" en même temps et ce test échoue
    // (2 prêts créés). C'est ce test qui prouve l'utilité du verrou.
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        createLoan({ userId: 1, copyId: 10, dueDate: '2099-01-01' })
      )
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled');
    const refused = results.filter(
      (r) => r.status === 'rejected' && r.reason.message === 'COPY_UNAVAILABLE'
    );
    expect(succeeded).toHaveLength(1);
    expect(refused).toHaveLength(9);
    expect(await countOpenLoans(10)).toBe(1);
  });
});
