#!/bin/bash


read -p "Entrez la version de l'image Docker (par exemple, 1.4): " version


if [ -z "$version" ]; then
  echo "La version n'a pas été spécifiée. Veuillez entrer une version."
  exit 1
fi


sudo docker build -t eden:$version .


sudo docker tag eden:$version registry.pdmdsante.com/eden:$version


sudo docker push registry.pdmdsante.com/eden:$version

echo "L'image eden:$version a été poussée vers le registre avec succès."
