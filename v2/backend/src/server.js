import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
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

const app = express();

// .trim() : une variable d'environnement collée avec un retour à la ligne
// (fréquent en copiant-collant une URL) fait planter le module "cors" avec
// ERR_INVALID_CHAR — une valeur invalide dans un en-tête HTTP.
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

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`API Biblio-Tech démarrée sur http://localhost:${port}`);
});
