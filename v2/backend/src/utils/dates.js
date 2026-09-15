// Date "YYYY-MM-DD" en UTC pur, pour éviter qu'un décalage de fuseau
// horaire ne fasse glisser la date d'un jour selon le serveur.
export function isoDateInDays(days = 0) {
  const now = new Date();
  const target = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + days)
  );
  return target.toISOString().slice(0, 10);
}
