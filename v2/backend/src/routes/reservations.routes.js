import { Router } from 'express';
import * as reservationsController from '../controllers/reservations.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createReservationSchema } from '../schemas/reservations.schema.js';

export const reservationsRouter = Router();

reservationsRouter.get('/me', requireAuth, asyncHandler(reservationsController.myReservations));
reservationsRouter.post(
  '/',
  requireAuth,
  validate(createReservationSchema),
  asyncHandler(reservationsController.create)
);
reservationsRouter.delete('/:id', requireAuth, asyncHandler(reservationsController.remove));
