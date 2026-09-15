import { pool } from '../database/pool.js';

// Si "date" est fourni, chaque salle embarque ses créneaux déjà réservés
// ce jour-là (pour que le frontend puisse griser les horaires pris).
export async function listRoomsWithAvailability(date) {
  const result = await pool.query(
    `
    SELECT
      r.id, r.name, r.capacity,
      COALESCE(
        json_agg(
          json_build_object('start_time', res.start_time::text, 'end_time', res.end_time::text)
          ORDER BY res.start_time
        ) FILTER (WHERE res.id IS NOT NULL),
        '[]'
      ) AS reservations
    FROM rooms r
    LEFT JOIN reservations res ON res.room_id = r.id AND res.date = $1::date
    GROUP BY r.id
    ORDER BY r.name
    `,
    [date || null]
  );
  return result.rows;
}

export async function roomExists(roomId) {
  const result = await pool.query('SELECT id FROM rooms WHERE id = $1', [roomId]);
  return result.rows.length > 0;
}
