import bcrypt from 'bcryptjs';
import { HttpError } from '../utils/HttpError.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
} from '../repositories/users.repository.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';

function toPublicUser(user) {
  const { password_hash, ...publicUser } = user;
  return publicUser;
}

export async function register({ name, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new HttpError(409, 'Un compte existe déjà avec cet email.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ name, email, passwordHash });
  return user;
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(401, 'Email ou mot de passe incorrect.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new HttpError(401, 'Email ou mot de passe incorrect.');
  }

  const publicUser = toPublicUser(user);
  return {
    user: publicUser,
    accessToken: signAccessToken(publicUser),
    refreshToken: signRefreshToken(publicUser),
  };
}

export async function refreshAccessToken(refreshToken) {
  if (!refreshToken) {
    throw new HttpError(401, 'Session expirée, merci de te reconnecter.');
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, 'Session expirée, merci de te reconnecter.');
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    throw new HttpError(401, 'Session expirée, merci de te reconnecter.');
  }

  const publicUser = toPublicUser(user);
  return { accessToken: signAccessToken(publicUser), user: publicUser };
}
