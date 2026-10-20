import { describe, it, expect } from 'vitest';
import { pool } from '../src/database/pool.js';
import { createLoan, returnLoanByCopy } from '../src/repositories/loans.repository.js';
import { createReservation } from '../src/repositories/reservations.repository.js';
import { insertReadingsBatch } from '../src/repositories/iot.repository.js';
import { setUserRole, createUser } from '../src/repositories/users.repository.js';
import { simulerRequetes, simulerTransaction } from './helpers/db.js';

const requetes = (client) => client.query.mock.calls.map(([sql]) => sql);

describe('loans.repository — createLoan (transaction)', () => {
  it('verrouille l’exemplaire, le marque indisponible puis valide', async () => {
    const client = simulerTransaction([
      ['FOR UPDATE', [{ id: 3, available: true }]],
      ['UPDATE copies', []],
      ['INSERT INTO loans', [{ id: 99, copy_id: 3 }]],
    ]);

    const pret = await createLoan({ userId: 1, copyId: 3, dueDate: '2099-01-15' });

    expect(pret).toEqual({ id: 99, copy_id: 3 });
    const sql = requetes(client);
    expect(sql[0]).toBe('BEGIN');
    expect(sql.at(-1)).toBe('COMMIT');
    expect(sql.findIndex((q) => q.includes('UPDATE copies'))).toBeLessThan(
      sql.findIndex((q) => q.includes('INSERT INTO loans'))
    );
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it('COPY_NOT_FOUND : annule la transaction et libère le client', async () => {
    const client = simulerTransaction([['FOR UPDATE', []]]);
    await expect(createLoan({ userId: 1, copyId: 3, dueDate: 'x' })).rejects.toThrow('COPY_NOT_FOUND');
    expect(requetes(client)).toContain('ROLLBACK');
    expect(requetes(client)).not.toContain('COMMIT');
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it('COPY_UNAVAILABLE : aucun prêt créé sur un exemplaire déjà sorti', async () => {
    const client = simulerTransaction([['FOR UPDATE', [{ id: 3, available: false }]]]);
    await expect(createLoan({ userId: 1, copyId: 3, dueDate: 'x' })).rejects.toThrow('COPY_UNAVAILABLE');
    expect(requetes(client).some((q) => q.includes('INSERT INTO loans'))).toBe(false);
    expect(client.release).toHaveBeenCalledTimes(1);
  });
});

describe('loans.repository — returnLoanByCopy', () => {
  it('LOAN_NOT_FOUND si aucun prêt en cours sur cet exemplaire', async () => {
    const client = simulerTransaction([['FOR UPDATE', []]]);
    await expect(returnLoanByCopy(3)).rejects.toThrow('LOAN_NOT_FOUND');
    expect(client.release).toHaveBeenCalled();
  });

  it('clôt le prêt et rend l’exemplaire disponible', async () => {
    const client = simulerTransaction([
      ['FOR UPDATE', [{ id: 5 }]],
      ['UPDATE loans', [{ id: 5, return_date: '2099-01-01' }]],
      ['UPDATE copies SET available = true', []],
    ]);
    expect(await returnLoanByCopy(3)).toEqual({ id: 5, return_date: '2099-01-01' });
    expect(requetes(client).at(-1)).toBe('COMMIT');
  });
});

describe('reservations.repository — createReservation', () => {
  const demande = { userId: 1, roomId: 2, date: '2099-01-01', startTime: '10:00', endTime: '11:00' };

  it('ROOM_NOT_FOUND sans ouvrir de transaction', async () => {
    simulerRequetes([['FROM rooms', []]]);
    await expect(createReservation(demande)).rejects.toThrow('ROOM_NOT_FOUND');
    expect(pool.connect).not.toHaveBeenCalled();
  });

  it('SLOT_TAKEN en cas de chevauchement, avec verrou sur salle+date', async () => {
    simulerRequetes([['FROM rooms', [{ id: 2 }]]]);
    const client = simulerTransaction([
      ['pg_advisory_xact_lock', []],
      ['FROM reservations', [{ id: 8 }]],
    ]);

    await expect(createReservation(demande)).rejects.toThrow('SLOT_TAKEN');

    const verrou = client.query.mock.calls.find(([sql]) => sql.includes('pg_advisory_xact_lock'));
    expect(verrou[1]).toEqual(['room-2-2099-01-01']);
    // Chevauchement : start_time < fin demandée ET end_time > début demandé
    const chevauchement = client.query.mock.calls.find(([sql]) => sql.includes('FROM reservations'));
    expect(chevauchement[1]).toEqual([2, '2099-01-01', '10:00', '11:00']);
    expect(client.release).toHaveBeenCalled();
  });

  it('insère la réservation quand le créneau est libre', async () => {
    simulerRequetes([['FROM rooms', [{ id: 2 }]]]);
    const client = simulerTransaction([
      ['pg_advisory_xact_lock', []],
      ['FROM reservations', []],
      ['INSERT INTO reservations', [{ id: 12 }]],
    ]);
    expect(await createReservation(demande)).toEqual({ id: 12 });
    expect(requetes(client).at(-1)).toBe('COMMIT');
  });
});

describe('iot.repository — insertReadingsBatch', () => {
  it('n’envoie aucune requête pour une liste vide', async () => {
    await insertReadingsBatch(1, []);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it('construit une insertion groupée paramétrée', async () => {
    simulerRequetes([['INSERT INTO sensor_readings', []]]);
    const t1 = new Date('2099-01-01T00:00:00Z');
    const t2 = new Date('2099-01-01T00:15:00Z');
    await insertReadingsBatch(4, [
      { value: 19.5, recordedAt: t1 },
      { value: 19.7, recordedAt: t2 },
    ]);
    const [sql, valeurs] = pool.query.mock.calls[0];
    expect(sql).toContain('($1, $2, $3), ($4, $5, $6)');
    expect(valeurs).toEqual([4, 19.5, t1, 4, 19.7, t2]);
  });
});

describe('users.repository', () => {
  it('setUserRole renvoie null pour un utilisateur inconnu', async () => {
    simulerRequetes([['UPDATE users', []]]);
    expect(await setUserRole(1, 'admin')).toBeNull();
  });

  it('createUser attribue toujours le rôle "user"', async () => {
    simulerRequetes([['INSERT INTO users', [{ id: 1, name: 'A', email: 'a@exemple.test' }]]]);
    expect(await createUser({ name: 'A', email: 'a@exemple.test', passwordHash: 'h' })).toEqual({
      id: 1,
      name: 'A',
      email: 'a@exemple.test',
      role: 'user',
    });
  });
});
