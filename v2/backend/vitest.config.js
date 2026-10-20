import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
    // Valeurs factices : dotenv ne remplace jamais une variable déjà définie,
    // donc un éventuel ".env" local ne peut pas fuiter dans les tests.
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/inexistante',
      JWT_ACCESS_SECRET: 'secret-acces-de-test',
      JWT_REFRESH_SECRET: 'secret-refresh-de-test',
      FRONTEND_URL: 'http://localhost:3000',
    },
  },
});
