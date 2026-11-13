// Ce fichier crée et configure l'application Express, SANS la démarrer.
// Le démarrage (app.listen) est dans server.js. Intérêt : les tests
// importent "app" directement et l'appellent avec supertest, sans
// ouvrir de vrai port réseau.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { booksRouter } from './routes/books.routes.js';
import { loansRouter } from './routes/loans.routes.js';
import { roomsRouter } from './routes/rooms.routes.js';
import { reservationsRouter } from './routes/reservations.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { iotRouter } from './routes/iot.routes.js';
import { automationsRouter } from './routes/automations.routes.js';
import { recommendationsRouter } from './routes/recommendations.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

export const app = express();

// En production, Render place un proxy devant l'API : sans ce réglage,
// Express verrait l'IP du proxy pour toutes les requêtes, et la limite de
// tentatives de connexion serait partagée par tous les utilisateurs.
// "1" = on fait confiance à un seul proxy, celui de l'hébergeur.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// helmet ajoute des en-têtes HTTP de sécurité à toutes les réponses
// (interdire l'affichage dans une iframe, empêcher le navigateur de
// deviner le type d'un fichier, forcer HTTPS, masquer "X-Powered-By"...).
app.use(helmet());

// .trim() : une variable d'environnement collée avec un retour à la ligne
// (fréquent en copiant-collant une URL) fait planter le module "cors" avec
// ERR_INVALID_CHAR, une valeur invalide dans un en-tête HTTP.
const frontendUrl = (process.env.FRONTEND_URL ?? 'http://localhost:3000').trim();

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/loans', loansRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/iot', iotRouter);
app.use('/api/automations', automationsRouter);
app.use('/api/recommendations', recommendationsRouter);

app.use(errorHandler);
