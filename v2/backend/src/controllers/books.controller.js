import * as booksService from '../services/books.service.js';
import { HttpError } from '../utils/HttpError.js';

export async function search(req, res) {
  const books = await booksService.searchBooks(req.query.q);
  res.json({ books });
}

export async function getById(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new HttpError(400, 'Identifiant de livre invalide.');
  }
  const book = await booksService.getBook(id);
  res.json({ book });
}
