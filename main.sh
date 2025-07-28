#!/bin/bash

read -p "Entrez la version de l'image Docker (par exemple, 1.4): " version

if [ -z "$version" ]; then
  echo "La version n'a pas été spécifiée. Veuillez entrer une version."
  exit 1
fi

# Build l'image Docker
echo "Construction de l'image Docker..."
if ! sudo docker build -t eden:$version .; then
  echo "Échec de la construction de l'image Docker"
  exit 1
fi

# Tagger l'image
echo "Taggage de l'image..."
sudo docker tag eden:$version registry.pdmdsante.com/eden:$version

# Vérifier l'authentification
echo "Vérification de l'authentification Docker..."
if ! sudo docker login registry.pdmdsante.com; then
  echo "Échec de l'authentification auprès du registry"
  exit 1
fi

# Pousser l'image
echo "Poussée de l'image vers le registry..."
if ! sudo docker push registry.pdmdsante.com/eden:$version; then
  echo "Échec du push vers le registre"
  echo "Conseils de dépannage:"
  echo "1. Vérifiez votre connexion Internet"
  echo "2. Essayez 'docker login registry.pdmdsante.com'"
  echo "3. Contactez l'administrateur du registry"
  exit 1
fi

echo "L'image eden:$version a été construite et poussée vers le registre avec succès."