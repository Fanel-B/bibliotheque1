import * as authService from '../services/auth.service.js';
import { findUserById } from '../repositories/users.repository.js';
import { HttpError } from '../utils/HttpError.js';
import {
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} from '../utils/tokens.js';

export async function register(req, res) {
  const user = await authService.register(req.body);
  res.status(201).json({ user });
}

export async function login(req, res) {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  res.json({ user, accessToken });
}

export async function refresh(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  const { accessToken, user } = await authService.refreshAccessToken(token);
  res.json({ accessToken, user });
}

export function logout(req, res) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.status(204).send();
}

export async function me(req, res) {
  const foundUser = await findUserById(req.user.id);
  if (!foundUser) {
    throw new HttpError(404, 'Utilisateur introuvable.');
  }
  const { password_hash, ...user } = foundUser;
  res.json({ user });
}
