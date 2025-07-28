# Étape 1 : Construction de l'application
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Création de l'image pour servir l'application
FROM nginx:alpine

# Copier les fichiers de build dans le répertoire de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Ajouter le fichier de configuration Nginx personnalisé
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
