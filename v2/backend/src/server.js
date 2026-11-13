// Point d'entrée en production et en développement : on récupère
// l'application configurée dans app.js et on la met à l'écoute d'un port.
import { app } from './app.js';

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
  console.log(`API Biblio-Tech démarrée sur http://localhost:${port}`);
});
