import * as recommendationsRepository from '../repositories/recommendations.repository.js';

export async function getRecommendationsForUser(userId) {
  const books = await recommendationsRepository.getRecommendationsForUser(userId);
  return books.map((book) => ({
    ...book,
    genre_score: Number(book.genre_score),
    author_score: Number(book.author_score),
    popularity_score: Number(book.popularity_score),
    score: Number(book.score),
  }));
}
