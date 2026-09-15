import { Router } from 'express';
import * as roomsController from '../controllers/rooms.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const roomsRouter = Router();

roomsRouter.get('/', asyncHandler(roomsController.listRooms));
