import { apiClient } from '../lib/apiClient';

export function searchBooks(query) {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiClient(`/api/books${params}`);
}

export function getBook(id) {
  return apiClient(`/api/books/${id}`);
}
