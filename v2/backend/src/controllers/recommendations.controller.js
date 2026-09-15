import * as recommendationsService from '../services/recommendations.service.js';

export async function myRecommendations(req, res) {
  const books = await recommendationsService.getRecommendationsForUser(req.user.id);
  res.json({ books });
}
