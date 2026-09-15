const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiClient(path, { method = 'GET', body, accessToken } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    // Nécessaire pour que le cookie httpOnly (refresh token) soit envoyé/reçu.
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    throw new Error(data?.error ?? 'Une erreur est survenue.');
  }

  return data;
}
