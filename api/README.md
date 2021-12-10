# API

L'API de la [Plateforme du SNU](https://snu.gouv.fr). Elle fournit un accès aux données à [l'interface publique](https://github.com/betagouv/service-national-universel/tree/master/app) et [l'interface de gestion](https://github.com/betagouv/service-national-universel/tree/master/admin). Elle est développée en Javascript, utilise le framework [Express](https://expressjs.com) et une base de données [MongoDB](https://www.mongodb.com/). La recherche de données est rendue possible grâce à [Elasticsearch](https://www.elastic.co/fr/products/elasticsearch).

## Installation

MongoDB et NodeJS 12+ doivent être installés pour faire fonctionner l'application. Elasticsearch n'est pas nécessaire sur l'environnement de développement.

```bash
git clone https://github.com/betagouv/service-national-universel.git
cd service-national-universel/api
npm install
```

## Utilisation

### Développement local

Lancer la commande `npm run dev` pour accéder à l'application via l'URL `http://localhost:3000`.

### Développement de l'API

 - Respecter les recommandations pour une API REST.
 - Utiliser les bons statuts (400, 401, 403, 404, 200) dans les réponses et les vérifier dans les appels côté client.
 - Au minimum, renvoyer un objet JSON avec `{ ok: true }` et à défaut d'autre chose on envoie un texte explicatif dans `msg`, par exemple : `{ ok: true, msg: "Le doc a été créé."}`. Exception : dans le cas d'un appel `GET` sur un document : on peut renvoyer directement le document en cas de succès.
 - Renvoyer le document concerné dans les requêtes PUT, POST et DELETE si possible.
 - Capturer les erreurs (sentry) en cas de 500.
