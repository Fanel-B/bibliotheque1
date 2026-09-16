// Le token d'accès va dans l'en-tête Authorization, jamais dans l'URL (ça
// finirait dans les logs serveur/navigateur) — donc un simple <a href> ne
// suffit pas. On récupère le fichier via fetch, puis on déclenche le
// téléchargement via une URL blob temporaire.
export async function downloadCsv(path, accessToken, filename) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${apiUrl}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error("Échec de l'export.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
