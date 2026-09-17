# 📚 Biblio-Tech

**Smart Library Management Platform** — une bibliothèque augmentée d'une couche domotique (IoT) simulée : catalogue, prêts, réservations de salles, dashboard analytics, et un simulateur de capteurs/équipements pilotable en temps réel, sans aucun matériel physique.

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

**[🔗 Démo en ligne](https://bibliotheque1.vercel.app)** · **[📡 API](https://bibliotheque1-jm6p.onrender.com/api/health)**

> ⏱️ Le backend est hébergé sur une offre gratuite qui se met en veille après 15 min d'inactivité — le premier chargement peut prendre 30 à 50 secondes.

---

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| Usager | `claire@bibliotech.demo` | `demo1234` |
| Employé | `hugo@bibliotech.demo` | `demo1234` |
| Admin | `admin@bibliotech.demo` | `demo1234` |

## Le projet

Biblio-Tech est la reconstruction complète d'un projet universitaire PHP/MySQL en une application moderne full-stack. L'ancienne version (conservée dans [`/legacy-php`](legacy-php) comme référence) a d'abord été **auditée** : bugs de sécurité (mots de passe en clair, faille de modélisation des rôles), schéma SQL incohérent, fonctionnalités inachevées. Ce diagnostic a servi de base à une reconstruction complète, avec une stack et une architecture pensées pour être démontrables en production — sans jamais dépendre d'un Raspberry Pi ou d'un matériel domotique réel.

## Fonctionnalités

**Usager** — catalogue avec recherche, emprunts, réservation de salles, recommandations personnalisées (calculées en SQL pur : genres/auteurs déjà lus, popularité, nouveautés).

**Employé** — poste de prêt (enregistrer un emprunt/retour), dashboard Smart Library en lecture (capteurs, alertes).

**Admin** — gestion des rôles, dashboard analytics (livres/genres populaires, tendances, KPIs), export CSV, pilotage complet de la couche IoT (équipements, scénarios de démonstration, automatisations, sécurité des archives).

### La couche Smart Library

- **Simulateur déterministe** — chaque valeur de capteur (température, humidité, luminosité, occupation...) est recalculée à la demande à partir de l'heure du jour, sans processus qui doit tourner en continu. L'historique des graphiques se reconstitue automatiquement au premier appel après une période d'inactivité.
- **5 scénarios de démonstration** — ouverture des archives, hausse de température, afflux de visiteurs, panne d'équipement, bascule d'éclairage.
- **Automatisations IF → THEN** — règles stockées en base (ex. *température > 27°C → ventilation*), évaluées en direct et journalisées.
- **Sécurité des archives** — détection d'ouverture hors horaires → événement → alerte, avec historique conservé.
- **Plan interactif** — visualisation des zones (Hall, Rayon A, Archives) avec équipements positionnés et colorés selon leur état.

## Stack technique

| Couche | Choix | Pourquoi |
|---|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS | Déploiement Vercel natif, très reconnu |
| Backend | Node.js + Express, architecture en couches (routes → controllers → services → repositories) | Explicite, sans magie |
| Base de données | PostgreSQL (Neon, serverless) | SQL brut visible dans les repositories — pas d'ORM qui masque la logique |
| Graphiques | Chart.js | KPIs, tendances, historique capteurs |
| Auth | JWT (access + refresh en cookie httpOnly) + bcrypt | Stateless, adapté à deux domaines séparés (Vercel/Render) |
| Déploiement | Vercel (frontend) + Render (backend) | Gratuit, CI/CD intégrée |

## Démarrer en local

```bash
# Backend
cd v2/backend
npm install
cp .env.example .env   # renseigner DATABASE_URL (Postgres), JWT secrets
npm run migrate
npm run seed            # crée le schéma + données de démo
npm run dev              # http://localhost:4000

# Frontend (dans un autre terminal)
cd v2/frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev              # http://localhost:3000
```

## Structure du dépôt

```
├── legacy-php/       # version originale PHP/MySQL (référence historique, non maintenue)
└── v2/
    ├── backend/      # API REST Express
    │   └── src/
    │       ├── routes/        controllers/     services/
    │       ├── repositories/  database/        middleware/
    └── frontend/     # Next.js App Router
        └── src/
            ├── app/            # pages par rôle
            ├── components/     services/       context/
```

## Notes de conception

- **Recommandations sans ML** — un score pondéré 100 % SQL (genres × 2, auteurs × 3, popularité × 1, nouveauté +1), volontairement simple et explicable.
- **Simulateur plutôt que hardware réel** — pensé dès le départ pour un hébergement gratuit qui met le service en veille ; les valeurs sont des fonctions pures du temps, pas un état qui doit persister.
- **Rôles verrouillés côté serveur** — l'inscription publique ne crée que des comptes usager ; seul un admin peut promouvoir un compte employé/admin (corrige une faille identifiée dans l'ancien projet).
