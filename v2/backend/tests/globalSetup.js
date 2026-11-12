import { execSync } from 'node:child_process';
import dotenv from 'dotenv';
import pg from 'pg';

// Remise à zéro complète de la base de test avant de lancer les tests :
// on supprime tout, puis on rejoue la migration et les seeds existants.
// Ainsi chaque "npm test" part exactement des mêmes données.
export default async function setup() {
  const env = dotenv.config({ path: '.env.test' }).parsed ?? {};
  const databaseUrl = env.DATABASE_URL;

  // Garde-fou : ce script EFFACE la base. On refuse de continuer si
  // l'URL ne vise pas une base locale (pour ne jamais toucher la prod).
  if (!databaseUrl || !/@(localhost|127\.0\.0\.1)[:/]/.test(databaseUrl)) {
    throw new Error(
      'Tests annulés : DATABASE_URL de .env.test doit viser une base locale (localhost).'
    );
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await client.end();

  // On réutilise les scripts npm du projet, avec les variables de .env.test.
  const options = { env: { ...process.env, ...env }, stdio: 'pipe' };
  execSync('node src/database/migrate.js', options);
  execSync('node src/database/seed.js', options);
}
