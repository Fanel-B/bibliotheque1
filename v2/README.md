# Biblio-Tech 2.0

## Structure

- `frontend/` — Next.js (App Router) + Tailwind CSS
- `backend/` — Express (API REST) + PostgreSQL

## Lancer le projet en local

### Backend

```bash
cd backend
npm install
cp .env.example .env   # puis renseigner DATABASE_URL une fois la base Neon créée
npm run dev
```

API disponible sur http://localhost:4000 — vérifier avec `GET /api/health`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Site disponible sur http://localhost:3000.
