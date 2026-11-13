# Image officielle Node.js, variante "alpine" (Linux très léger).
FROM node:20-alpine

# Dossier de travail à l'intérieur du conteneur.
WORKDIR /app

# On copie d'abord seulement package.json et package-lock.json, puis on
# installe les dépendances : Docker garde cette étape en cache tant que
# ces deux fichiers ne changent pas, ce qui accélère les reconstructions.
# "npm ci" installe exactement les versions du package-lock.json, et
# "--omit=dev" laisse de côté vitest et supertest (inutiles en production).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Puis le code source.
COPY src ./src

EXPOSE 4000
CMD ["npm", "start"]
