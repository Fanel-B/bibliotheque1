import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';

// Les tests lisent leurs variables dans .env.test (base locale jetable),
// jamais dans .env (qui pointe vers la vraie base).
// dotenv ne remplace pas une variable déjà définie : en les chargeant ici,
// avant tout le reste, on est sûr que le "dotenv/config" de l'app ne
// pourra pas les écraser avec celles de .env.
const testEnv = dotenv.config({ path: '.env.test' }).parsed ?? {};

export default defineConfig({
  test: {
    env: { ...testEnv, NODE_ENV: 'test' },
    // Exécuté une seule fois avant tous les tests : remise à zéro de la base.
    globalSetup: './tests/globalSetup.js',
    // Les fichiers de test partagent la même base : on les lance l'un
    // après l'autre pour qu'ils ne se marchent pas dessus.
    fileParallelism: false,
  },
});
