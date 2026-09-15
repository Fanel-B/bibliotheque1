import { pool } from '../database/pool.js';

const SELECT_WITH_ROLE = `
  SELECT u.id, u.name, u.email, u.password_hash, u.created_at, r.name AS role
  FROM users u
  JOIN roles r ON r.id = u.role_id
`;

export async function findUserByEmail(email) {
  const result = await pool.query(`${SELECT_WITH_ROLE} WHERE u.email = $1`, [email]);
  return result.rows[0] ?? null;
}

export async function findUserById(id) {
  const result = await pool.query(`${SELECT_WITH_ROLE} WHERE u.id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function listAllUsers() {
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, r.name AS role, u.created_at
     FROM users u
     JOIN roles r ON r.id = u.role_id
     ORDER BY u.created_at DESC`
  );
  return result.rows;
}

// Rôle "user" (id 1) : c'est le seul rôle qu'un visiteur peut se donner
// lui-même via l'inscription publique. Employé/admin sont créés par un admin.
export async function createUser({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash, role_id)
     VALUES ($1, $2, $3, 1)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return { ...result.rows[0], role: 'user' };
}
