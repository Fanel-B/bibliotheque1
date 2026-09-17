// .trim() : une variable d'environnement collée avec un espace ou un retour
// à la ligne produit une URL invalide et fetch() échoue avec "Failed to
// fetch" sans autre détail (vu sur Render avec FRONTEND_URL — même piège
// possible ici avec NEXT_PUBLIC_API_URL).
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();

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
