import { Router } from 'express';
import * as booksController from '../controllers/books.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const booksRouter = Router();

booksRouter.get('/', asyncHandler(booksController.search));
booksRouter.get('/:id', asyncHandler(booksController.getById));
