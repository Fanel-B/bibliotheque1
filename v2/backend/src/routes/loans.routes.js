import { Router } from 'express';
import * as loansController from '../controllers/loans.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createLoanSchema } from '../schemas/loans.schema.js';

export const loansRouter = Router();

loansRouter.get('/me', requireAuth, asyncHandler(loansController.myLoans));

loansRouter.get(
  '/overdue',
  requireAuth,
  requireRole('admin'),
  asyncHandler(loansController.overdue)
);

loansRouter.post(
  '/',
  requireAuth,
  requireRole('employee', 'admin'),
  validate(createLoanSchema),
  asyncHandler(loansController.create)
);

loansRouter.patch(
  '/:copyId/return',
  requireAuth,
  requireRole('employee', 'admin'),
  asyncHandler(loansController.returnByCopy)
);
