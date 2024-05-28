# Interface publique

Cette application utilise l'[API du SNU](https://github.com/betagouv/service-national-universel/tree/master/api). Elle est développée en Javascript et est construite avec [React](https://reactjs.org/).

## Installation

NodeJS 12+ doit être installé pour faire fonctionner l'application.

```bash
git clone https://github.com/betagouv/service-national-universel.git
cd service-national-universel/app
npm i
```

## Utilisation (locale)

Lancer la commande `npm run dev` pour accéder à l'application via l'URL `http://localhost:8081`. Voir le fichier `package.json` pour le détail des commandes.

## Variables d'environnements (local)

En local, si vous mettez des variables d'environnement dans un fichier `.env` à la racine du projet "app", elles seront automatiquement injectées dans l'application. (s'inspirer de .env-example)

## Variables d'environnements (docker)

En production, les fichiers statiques générés par l'étape de build sont servis par [nginx](https://nginx.org/en/docs/) (cf [Dockerfile](Dockerfile) & [docker_nginx.conf](docker_nginx.conf))

Une étape de substitution des variables d'environnement est effectuée au runtime, juste avant le démarrage du serveur (cf [envsubst](https://www.gnu.org/software/gettext/manual/html_node/envsubst-Invocation.html) & [docker_start.sh](docker_start.sh))

Pour ajouter une variable d'environnement, modifier les fichiers suivants :

- Ajouter les variables dans les différents environnements de docker_config, il seront injectés dans [docker_start.sh](docker_start.sh) (substitution de la variable au runtime)
- [src/config.js](src/config.js) (recuperation de la variable dans la config, une valeur par défaut peut être présente)

Une variable d'environnement existente mais vide ("") sera ignorée

## À propos

> La startup d’Etat vise donc à créer un espace personnel où chacun des jeunes effectuant son SNU pourra gérer sa participation en choisissant ses missions d’intérêt général et obtenir si nécessaire de l’aide. Cet espace qui pourra ensuite intégrer des services complémentaires liés au déroulement du SNU sera partie prenante du site informationnel snu.gouv.fr. Notre souhait est de construire un service adapté aux usages de jeunes de 15 ans et non pas destiné à répondre aux contraintes de l’administration.

Source : https://beta.gouv.fr/startups/engagement-civique.html .
