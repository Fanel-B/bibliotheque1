import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setRoleSchema } from '../schemas/users.schema.js';

export const adminRouter = Router();

// Toutes les routes admin exigent le rôle admin — posé une seule fois ici.
adminRouter.use(requireAuth, requireRole('admin'));

adminRouter.get('/users', asyncHandler(adminController.users));
adminRouter.patch(
  '/users/:id/role',
  validate(setRoleSchema),
  asyncHandler(adminController.changeUserRole)
);
adminRouter.get('/logs', asyncHandler(adminController.logs));
adminRouter.get('/analytics/overview', asyncHandler(adminController.overview));
adminRouter.get('/analytics/popular-books', asyncHandler(adminController.popularBooks));
adminRouter.get('/analytics/popular-genres', asyncHandler(adminController.popularGenres));
adminRouter.get('/analytics/trends', asyncHandler(adminController.trends));
