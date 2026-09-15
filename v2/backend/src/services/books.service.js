import { HttpError } from '../utils/HttpError.js';
import * as booksRepository from '../repositories/books.repository.js';

export async function searchBooks(search) {
  const books = await booksRepository.listBooks(search);
  return books.map((book) => ({
    ...book,
    available_copies: Number(book.available_copies),
    total_copies: Number(book.total_copies),
  }));
}

export async function getBook(id) {
  const book = await booksRepository.getBookById(id);
  if (!book) {
    throw new HttpError(404, 'Livre introuvable.');
  }
  return book;
}
