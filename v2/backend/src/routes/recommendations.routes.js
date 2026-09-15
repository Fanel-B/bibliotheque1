import { Router } from 'express';
import * as recommendationsController from '../controllers/recommendations.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const recommendationsRouter = Router();

recommendationsRouter.get('/me', requireAuth, asyncHandler(recommendationsController.myRecommendations));
