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
  // Le navigateur n'efface un cookie que si on lui renvoie les mêmes
  // attributs qu'à sa création (path, secure, sameSite). En production, un
  // effacement sans "SameSite=None; Secure" serait refusé (front et API sont
  // sur deux domaines différents) et l'utilisateur resterait connecté.
  // On retire maxAge : avec Express 4, il remplacerait la date d'expiration
  // passée par une date future, et le cookie ne serait pas effacé.
  const { maxAge, ...cookieOptions } = refreshCookieOptions();
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
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
