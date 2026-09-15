import { Router } from 'express';
import { getServerHealth, getDatabaseHealth } from '../controllers/health.controller.js';

export const healthRouter = Router();

healthRouter.get('/', getServerHealth);
healthRouter.get('/db', getDatabaseHealth);
