import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

// authLimiter est placé en premier : une requête bloquée ne coûte même
// pas une validation ni un calcul bcrypt.
authRouter.post(
  '/register',
  authLimiter,
  validate(registerSchema),
  asyncHandler(authController.register)
);
authRouter.post('/login', authLimiter, validate(loginSchema), asyncHandler(authController.login));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
