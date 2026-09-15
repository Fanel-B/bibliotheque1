import { pool } from '../database/pool.js';

export async function listBooks(search) {
  const result = await pool.query(
    `
    SELECT
      b.id, b.title, b.format, b.published_year, b.cover_url,
      COALESCE(array_agg(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL), '{}') AS authors,
      COALESCE(array_agg(DISTINCT g.label) FILTER (WHERE g.label IS NOT NULL), '{}') AS genres,
      COUNT(DISTINCT c.id) FILTER (WHERE c.available) AS available_copies,
      COUNT(DISTINCT c.id) AS total_copies
    FROM books b
    LEFT JOIN book_authors ba ON ba.book_id = b.id
    LEFT JOIN authors a ON a.id = ba.author_id
    LEFT JOIN book_genres bg ON bg.book_id = b.id
    LEFT JOIN genres g ON g.id = bg.genre_id
    LEFT JOIN copies c ON c.book_id = b.id
    WHERE
      $1::text IS NULL
      OR b.title ILIKE '%' || $1 || '%'
      OR EXISTS (
        SELECT 1 FROM book_authors ba2
        JOIN authors a2 ON a2.id = ba2.author_id
        WHERE ba2.book_id = b.id AND a2.name ILIKE '%' || $1 || '%'
      )
      OR EXISTS (
        SELECT 1 FROM book_genres bg2
        JOIN genres g2 ON g2.id = bg2.genre_id
        WHERE bg2.book_id = b.id AND g2.label ILIKE '%' || $1 || '%'
      )
    GROUP BY b.id
    ORDER BY b.title
    `,
    [search || null]
  );
  return result.rows;
}

export async function getBookById(id) {
  const bookResult = await pool.query(
    `
    SELECT
      b.id, b.title, b.description, b.format, b.published_year, b.cover_url,
      COALESCE(array_agg(DISTINCT a.name) FILTER (WHERE a.name IS NOT NULL), '{}') AS authors,
      COALESCE(array_agg(DISTINCT g.label) FILTER (WHERE g.label IS NOT NULL), '{}') AS genres
    FROM books b
    LEFT JOIN book_authors ba ON ba.book_id = b.id
    LEFT JOIN authors a ON a.id = ba.author_id
    LEFT JOIN book_genres bg ON bg.book_id = b.id
    LEFT JOIN genres g ON g.id = bg.genre_id
    WHERE b.id = $1
    GROUP BY b.id
    `,
    [id]
  );

  const book = bookResult.rows[0];
  if (!book) return null;

  const copiesResult = await pool.query(
    'SELECT id, state, available FROM copies WHERE book_id = $1 ORDER BY id',
    [id]
  );

  return { ...book, copies: copiesResult.rows };
}
