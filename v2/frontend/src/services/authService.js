import { apiClient } from '../lib/apiClient';

export function login(email, password) {
  return apiClient('/api/auth/login', { method: 'POST', body: { email, password } });
}

export function register(name, email, password) {
  return apiClient('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
}

export function refresh() {
  return apiClient('/api/auth/refresh', { method: 'POST' });
}

export function logout() {
  return apiClient('/api/auth/logout', { method: 'POST' });
}

export function me(accessToken) {
  return apiClient('/api/auth/me', { accessToken });
}
