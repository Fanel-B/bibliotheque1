import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

export const authRouter = Router();

// authLimiter vient juste après la validation : il compte ainsi par email
// déjà normalisé (minuscules), et une requête bloquée ne coûte jamais de
// calcul bcrypt, l'étape lente et coûteuse.
authRouter.post(
  '/register',
  validate(registerSchema),
  authLimiter,
  asyncHandler(authController.register)
);
authRouter.post('/login', validate(loginSchema), authLimiter, asyncHandler(authController.login));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, asyncHandler(authController.me));
