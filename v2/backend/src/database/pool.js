import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Neon (Postgres) suspend son compute après un moment d'inactivité et coupe
// la connexion sous-jacente. `pg` remonte ça comme un événement "error" sur
// un client du pool qui attendait, inactif — sans ce handler, Node considère
// l'erreur non gérée et fait crasher tout le process. Le pool recréera une
// connexion à la prochaine requête, donc on se contente de logger.
pool.on('error', (error) => {
  console.error('Erreur sur une connexion inactive du pool PostgreSQL :', error.message);
});
