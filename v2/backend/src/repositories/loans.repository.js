import { pool } from '../database/pool.js';

// Emprunt : on verrouille la ligne "copies" (FOR UPDATE) le temps de la
// transaction pour empêcher deux employés de prêter le même exemplaire en
// même temps (l'un des deux verra COPY_UNAVAILABLE au lieu de créer un
// deuxième prêt sur un exemplaire déjà sorti).
export async function createLoan({ userId, copyId, dueDate }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const copyResult = await client.query(
      'SELECT id, available FROM copies WHERE id = $1 FOR UPDATE',
      [copyId]
    );
    const copy = copyResult.rows[0];

    if (!copy) {
      await client.query('ROLLBACK');
      throw new Error('COPY_NOT_FOUND');
    }
    if (!copy.available) {
      await client.query('ROLLBACK');
      throw new Error('COPY_UNAVAILABLE');
    }

    await client.query('UPDATE copies SET available = false WHERE id = $1', [copyId]);

    const loanResult = await client.query(
      `INSERT INTO loans (user_id, copy_id, due_date)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, copy_id, loan_date::text, due_date::text, return_date::text`,
      [userId, copyId, dueDate]
    );

    await client.query('COMMIT');
    return loanResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

// On identifie le retour par l'exemplaire (ce que l'employé a sous les
// yeux), pas par un id de prêt abstrait qu'il n'a aucun moyen de connaître.
export async function returnLoanByCopy(copyId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const loanResult = await client.query(
      `SELECT id FROM loans WHERE copy_id = $1 AND return_date IS NULL FOR UPDATE`,
      [copyId]
    );
    const loan = loanResult.rows[0];

    if (!loan) {
      await client.query('ROLLBACK');
      throw new Error('LOAN_NOT_FOUND');
    }

    const updated = await client.query(
      `UPDATE loans SET return_date = CURRENT_DATE WHERE id = $1
       RETURNING id, user_id, copy_id, loan_date::text, due_date::text, return_date::text`,
      [loan.id]
    );
    await client.query('UPDATE copies SET available = true WHERE id = $1', [copyId]);

    await client.query('COMMIT');
    return updated.rows[0];
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

export async function listAllLoans() {
  const result = await pool.query(
    `SELECT l.id, u.name AS user_name, u.email,
            b.title, l.loan_date::text, l.due_date::text, l.return_date::text
     FROM loans l
     JOIN users u ON u.id = l.user_id
     JOIN copies c ON c.id = l.copy_id
     JOIN books b ON b.id = c.book_id
     ORDER BY l.loan_date DESC, l.id DESC`
  );
  return result.rows;
}

export async function listLoansByUser(userId) {
  const result = await pool.query(
    `SELECT l.id, l.loan_date::text, l.due_date::text, l.return_date::text,
            b.id AS book_id, b.title, b.cover_url
     FROM loans l
     JOIN copies c ON c.id = l.copy_id
     JOIN books b ON b.id = c.book_id
     WHERE l.user_id = $1
     ORDER BY l.loan_date DESC, l.id DESC`,
    [userId]
  );
  return result.rows;
}

export async function listOverdueLoans() {
  const result = await pool.query(
    `SELECT l.id, l.due_date::text, u.name AS user_name, u.email, b.title
     FROM loans l
     JOIN users u ON u.id = l.user_id
     JOIN copies c ON c.id = l.copy_id
     JOIN books b ON b.id = c.book_id
     WHERE l.return_date IS NULL AND l.due_date < CURRENT_DATE
     ORDER BY l.due_date ASC`
  );
  return result.rows;
}
