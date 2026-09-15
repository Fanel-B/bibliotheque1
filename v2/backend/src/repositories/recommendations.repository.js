import { pool } from '../database/pool.js';

// 4 signaux combinés en un score pondéré, entièrement en SQL — pas de
// modèle, pas d'API externe (voir section 13 du dossier d'architecture) :
//   - genres déjà empruntés (poids x2)
//   - auteurs déjà empruntés (poids x3)
//   - popularité globale (poids x1)
//   - nouveauté dans un genre déjà aimé (bonus +1)
// On exclut les livres déjà empruntés par l'utilisateur (rien d'utile à
// "recommander" pour un livre qu'il a déjà lu).
export async function getRecommendationsForUser(userId, limit = 8) {
  const result = await pool.query(
    `
    WITH already_borrowed AS (
      SELECT DISTINCT c.book_id
      FROM loans l
      JOIN copies c ON c.id = l.copy_id
      WHERE l.user_id = $1
    ),
    user_genres AS (
      SELECT bg.genre_id, COUNT(*) AS weight
      FROM loans l
      JOIN copies c ON c.id = l.copy_id
      JOIN book_genres bg ON bg.book_id = c.book_id
      WHERE l.user_id = $1
      GROUP BY bg.genre_id
    ),
    user_authors AS (
      SELECT ba.author_id, COUNT(*) AS weight
      FROM loans l
      JOIN copies c ON c.id = l.copy_id
      JOIN book_authors ba ON ba.book_id = c.book_id
      WHERE l.user_id = $1
      GROUP BY ba.author_id
    ),
    genre_score AS (
      SELECT bg.book_id, SUM(ug.weight) AS score
      FROM book_genres bg
      JOIN user_genres ug ON ug.genre_id = bg.genre_id
      GROUP BY bg.book_id
    ),
    author_score AS (
      SELECT ba.book_id, SUM(ua.weight) AS score
      FROM book_authors ba
      JOIN user_authors ua ON ua.author_id = ba.author_id
      GROUP BY ba.book_id
    ),
    popularity AS (
      SELECT c.book_id, COUNT(*) AS loan_count
      FROM loans l
      JOIN copies c ON c.id = l.copy_id
      GROUP BY c.book_id
    )
    SELECT
      b.id, b.title, b.cover_url,
      COALESCE(gs.score, 0)  AS genre_score,
      COALESCE(aus.score, 0) AS author_score,
      COALESCE(p.loan_count, 0) AS popularity_score,
      (
        COALESCE(gs.score, 0) * 2
        + COALESCE(aus.score, 0) * 3
        + COALESCE(p.loan_count, 0) * 1
        + CASE
            WHEN b.created_at > NOW() - INTERVAL '60 days' AND COALESCE(gs.score, 0) > 0
            THEN 1 ELSE 0
          END
      ) AS score
    FROM books b
    LEFT JOIN genre_score gs ON gs.book_id = b.id
    LEFT JOIN author_score aus ON aus.book_id = b.id
    LEFT JOIN popularity p ON p.book_id = b.id
    WHERE b.id NOT IN (SELECT book_id FROM already_borrowed)
    ORDER BY score DESC, b.title
    LIMIT $2
    `,
    [userId, limit]
  );
  return result.rows;
}
