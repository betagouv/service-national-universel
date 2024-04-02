# Interface de gestion

Cette application utilise l'[API du SNU](https://github.com/betagouv/service-national-universel/tree/master/api). Elle est développée en Javascript et est construite avec [React](https://reactjs.org/).

## Installation

NodeJS 12+ doit être installé pour faire fonctionner l'application.

```
git clone https://github.com/betagouv/service-national-universel.git
cd service-national-universel/admin
npm i
```

## Utilisation (locale)

Lancer la commande `npm run dev` pour accéder à l'application via l'URL `http://localhost:8081`. Voir le fichier `package.json` pour le détail des commandes.

## Variables d'environnements

En production, les fichiers statiques générés par l'étape de build sont servis par [nginx](https://nginx.org/en/docs/) (cf [Dockerfile](Dockerfile) & [docker_nginx.conf](docker_nginx.conf))

Une étape de substitution des variables d'environnement est effectuée au runtime, juste avant le démarrage du serveur (cf [envsubst](https://www.gnu.org/software/gettext/manual/html_node/envsubst-Invocation.html) & [docker_start.sh](docker_start.sh))

Pour ajouter une variable d'environnement, modifier les fichiers suivants :

- [docker_start.sh](docker_start.sh) (substitution de la variable au runtime)
- [src/config.js](src/config.js) (recuperation de la variable dans la config)
- [../terraform](les fichiers terraform impactés)

Une variable d'environnement existente mais vide ("") sera ignorée

## À propos

> En miroir, la startup d’Etat construit une interface de gestion permettant aux structures proposant les missions d’intérêt général de déposer des offres de missions et de les gérer et aux coordinateurs du service national universel (réseau de référents départementaux et régionaux) de se décharger des process administratifs afin de pouvoir être plus disponibles pour appuyer les jeunes qui en expriment le besoin.

Source : https://beta.gouv.fr/startups/engagement-civique.html
.
