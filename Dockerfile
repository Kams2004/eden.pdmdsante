# Étape 1 : Construction de l'application
FROM node:18-alpine AS builder

WORKDIR /app

# Copier seulement les fichiers de dépendances d'abord (pour un meilleur cache)
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production=false

# Copier tout le code source
COPY . .

# Construire l'application avec Vite
RUN npm run build

# Vérifier que le répertoire dist existe
RUN ls -la /app/dist

# Étape 2 : Création de l'image pour servir l'application
FROM nginx:alpine

# Supprimer la configuration par défaut de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copier les fichiers de build depuis le répertoire 'dist'
COPY --from=builder /app/dist /usr/share/nginx/html

# Ajouter le fichier de configuration Nginx personnalisé
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Utiliser l'utilisateur nginx existant (pas besoin de le créer)
USER nginx

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]