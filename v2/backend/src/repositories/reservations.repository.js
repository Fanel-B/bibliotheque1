import { pool } from '../database/pool.js';
import { roomExists } from './rooms.repository.js';

export async function createReservation({ userId, roomId, date, startTime, endTime }) {
  const exists = await roomExists(roomId);
  if (!exists) {
    throw new Error('ROOM_NOT_FOUND');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verrou logique par salle+date : sérialise les tentatives de réservation
    // sur ce créneau, même s'il n'existe encore aucune ligne à verrouiller
    // avec un simple "FOR UPDATE" (le créneau n'a pas encore de ligne tant
    // que personne ne l'a réservé).
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', [
      `room-${roomId}-${date}`,
    ]);

    const overlap = await client.query(
      `SELECT id FROM reservations
       WHERE room_id = $1 AND date = $2
         AND start_time < $4 AND end_time > $3`,
      [roomId, date, startTime, endTime]
    );

    if (overlap.rows.length > 0) {
      await client.query('ROLLBACK');
      throw new Error('SLOT_TAKEN');
    }

    const result = await client.query(
      `INSERT INTO reservations (user_id, room_id, date, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, room_id, date::text, start_time::text, end_time::text`,
      [userId, roomId, date, startTime, endTime]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function deleteReservation(id, userId) {
  const result = await pool.query(
    'DELETE FROM reservations WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows[0] ?? null;
}

export async function listReservationsByUser(userId) {
  const result = await pool.query(
    `SELECT res.id, res.date::text, res.start_time::text, res.end_time::text,
            r.id AS room_id, r.name AS room_name
     FROM reservations res
     JOIN rooms r ON r.id = res.room_id
     WHERE res.user_id = $1
     ORDER BY res.date DESC, res.start_time DESC`,
    [userId]
  );
  return result.rows;
}
