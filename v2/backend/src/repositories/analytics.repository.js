import { pool } from '../database/pool.js';

export async function getOverview() {
  const result = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM users) AS total_users,
      (SELECT COUNT(*)::int FROM loans WHERE return_date IS NULL) AS active_loans,
      (SELECT COUNT(*)::int FROM loans WHERE return_date IS NULL AND due_date < CURRENT_DATE) AS overdue_loans,
      (SELECT COUNT(*)::int FROM reservations WHERE date = CURRENT_DATE) AS reservations_today
  `);
  return result.rows[0];
}

export async function getPopularBooks(limit = 5) {
  const result = await pool.query(
    `
    SELECT b.id, b.title, COUNT(l.id)::int AS loan_count
    FROM books b
    JOIN copies c ON c.book_id = b.id
    JOIN loans l ON l.copy_id = c.id
    GROUP BY b.id
    ORDER BY loan_count DESC, b.title
    LIMIT $1
    `,
    [limit]
  );
  return result.rows;
}

export async function getPopularGenres(limit = 5) {
  const result = await pool.query(
    `
    SELECT g.label, COUNT(l.id)::int AS loan_count
    FROM genres g
    JOIN book_genres bg ON bg.genre_id = g.id
    JOIN copies c ON c.book_id = bg.book_id
    JOIN loans l ON l.copy_id = c.id
    GROUP BY g.label
    ORDER BY loan_count DESC, g.label
    LIMIT $1
    `,
    [limit]
  );
  return result.rows;
}

// generate_series comble les jours sans aucun prêt avec 0, pour ne pas
// afficher une tendance faussement optimiste qui "saute" les jours creux.
export async function getLoanTrends(days = 14) {
  const result = await pool.query(
    `
    SELECT
      to_char(day, 'YYYY-MM-DD') AS date,
      COALESCE(counts.count, 0)::int AS count
    FROM generate_series(
      CURRENT_DATE - ($1::int - 1), CURRENT_DATE, INTERVAL '1 day'
    ) AS day
    LEFT JOIN (
      SELECT loan_date, COUNT(*) AS count
      FROM loans
      GROUP BY loan_date
    ) counts ON counts.loan_date = day
    ORDER BY day
    `,
    [days]
  );
  return result.rows;
}
