// .trim() : une variable d'environnement collée avec un espace ou un retour
// à la ligne produit une URL invalide et fetch() échoue avec "Failed to
// fetch" sans autre détail (vu sur Render avec FRONTEND_URL, même piège
// possible ici avec NEXT_PUBLIC_API_URL).
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').trim();

// L'API est hébergée sur une offre gratuite qui se met en veille. Pendant
// son réveil (30 à 50 s), la requête peut échouer côté réseau ou recevoir
// une page d'erreur HTML (502/503) au lieu de notre JSON.
const WAKING_STATUSES = [502, 503, 504];
const WAKING_MESSAGE =
  'Le serveur est en train de démarrer (hébergement gratuit en veille). Réessaie dans quelques secondes.';
const RETRY_DELAYS_MS = [3000, 6000, 10000];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function send(path, { method, body, accessToken }) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(`${API_URL}${path}`, {
    method,
    headers,
    // Nécessaire pour que le cookie httpOnly (refresh token) soit envoyé/reçu.
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiClient(path, { method = 'GET', body, accessToken } = {}) {
  let response;

  // Quelques nouvelles tentatives espacées, seulement si le serveur ne
  // répond pas encore (réveil). Une vraie réponse d'erreur de l'API
  // (401, 409...) n'est jamais réessayée.
  for (let attempt = 0; ; attempt++) {
    try {
      response = await send(path, { method, body, accessToken });
      if (!WAKING_STATUSES.includes(response.status)) break;
    } catch {
      response = null; // erreur réseau : serveur injoignable pour l'instant
    }
    if (attempt >= RETRY_DELAYS_MS.length) {
      throw new Error(WAKING_MESSAGE);
    }
    await wait(RETRY_DELAYS_MS[attempt]);
  }

  if (response.status === 204) return null;

  // Une réponse qui n'est pas du JSON vient de l'hébergeur, pas de l'API.
  let data = null;
  try {
    data = await response.json();
  } catch {
    throw new Error(response.ok ? 'Réponse inattendue du serveur.' : WAKING_MESSAGE);
  }

  if (!response.ok) {
    throw new Error(data?.error ?? 'Une erreur est survenue.');
  }

  return data;
}
