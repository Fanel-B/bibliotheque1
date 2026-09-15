import { Router } from 'express';
import * as automationsController from '../controllers/automations.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setEnabledSchema } from '../schemas/automations.schema.js';

export const automationsRouter = Router();

automationsRouter.use(requireAuth, requireRole('admin'));

automationsRouter.get('/', asyncHandler(automationsController.list));
automationsRouter.get('/logs', asyncHandler(automationsController.logs));
automationsRouter.patch(
  '/:id',
  validate(setEnabledSchema),
  asyncHandler(automationsController.setEnabled)
);
