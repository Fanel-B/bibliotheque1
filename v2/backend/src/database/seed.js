import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEMO_PASSWORD = 'demo1234';

const demoUsers = [
  { id: 1, name: 'Claire Martin', email: 'claire@bibliotech.demo', roleId: 1 }, // user
  { id: 2, name: 'Hugo Lefevre', email: 'hugo@bibliotech.demo', roleId: 2 }, // employee
  { id: 3, name: 'Admin Biblio', email: 'admin@bibliotech.demo', roleId: 3 }, // admin
];

async function seed() {
  const client = await pool.connect();
  try {
    console.log('→ Insertion des données de référence (catalogue, salles, IoT)...');
    const sql = readFileSync(
      path.join(__dirname, 'seeds', '001_reference_data.sql'),
      'utf-8'
    );
    await client.query(sql);

    console.log('→ Création des comptes de démonstration...');
    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

    for (const user of demoUsers) {
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [user.id, user.name, user.email, passwordHash, user.roleId]
      );
    }
    await client.query(
      `SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`
    );

    console.log('→ Insertion de prêts de démonstration (pour les statistiques)...');
    const loansSql = readFileSync(
      path.join(__dirname, 'seeds', '002_demo_loans.sql'),
      'utf-8'
    );
    await client.query(loansSql);

    console.log('\nTerminé. Comptes de démonstration (mot de passe pour tous : "demo1234") :');
    demoUsers.forEach((u) => console.log(`  - ${u.email}`));
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Échec du seed :', error.message);
  process.exit(1);
});
