# Lot P15 — Configuration et durcissement des plateformes API

Audit de sécurité de la production du 25/09/2026, constats PM7, PM12 (moyenne), PL5, PL12, PL15
(faible) (ticket Linear GOO-80). Vérifié ouvert puis corrigé le 2026-09-26 sur `origin/main` @
`181a35173`. PM40/PM41 (ex-P15) sont partis dans P08 (GOO-72, déjà fusionné) ; PL13 ne comporte
aucun code (suivi infra ci-dessous) ; PL4 (cookies hôte API) est un lot séparé (P28, GOO-79, PR
#5406).

## 1. Constats et correctifs

| Constat | Surface | Avant | Après |
| --- | --- | --- | --- |
| PM7 | Démarrage de `api` et `apiv2` ; ensuite toutes les routes authentifiées par JWT | `ENVIRONMENT` absent ou mal orthographié retombait silencieusement sur `"development"` (`api/src/config.ts`, `apiv2/src/config/configuration.ts`) : `JWT_SECRET` valait alors le secret public `"dev-secret"`, et la garde de démarrage ne couvrait que `{production,staging,ci,custom}` — les recettes (`env-<branche>`) y échappaient aussi | `ENVIRONMENT` doit être explicitement l'une de `{production,staging,ci,custom,test,development}` ou matcher `^env-[a-z0-9-]+$`, sinon échec au démarrage ; `NODE_ENV`, s'il est positionné, doit être absent ou égal à `ENVIRONMENT` ; `JWT_SECRET` est désormais exigé pour **tout** environnement hors `development`/`test` (recettes comprises) |
| PM12 | `POST /elasticsearch/*/search` (toutes les routes qui passent par `joiElasticSearch`/`searchSubQuery`), notamment `by-structure/:id/search` ouverte aux volontaires | Le filtre `searchbar` n'avait de plafond que sur le nombre d'éléments du tableau (`.max(200)`), pas sur la longueur de la chaîne ; `searchSubQuery` générait 3 clauses `multi_match` par mot sans limite | `searchbar` plafonné à 200 caractères par élément (Joi) ; `searchSubQuery` ne retient que les 20 premiers mots |
| PL5 | CORS global à credentials de l'api v1 (`api/src/main.js`) | `origin` incluait `APP_URL`, `ADMIN_URL`, `SUPPORT_URL` (serveur à serveur, n'a jamais besoin de CORS), `SUPPORT_FRONT_URL`, `KNOWLEDGEBASE_URL` et l'hôte mort `https://inscription.snu.gouv.fr` (2021), tous avec `credentials: true` | CORS à credentials réduit à `[APP_URL, ADMIN_URL]` ; `KNOWLEDGEBASE_URL` (GET `/signin/token`, POST `/signin/logout`) et `SUPPORT_FRONT_URL` (GET `/cohort/public`) reçoivent un CORS dédié sans credentials, limité à ces routes ; `SUPPORT_URL` et l'hôte mort retirés |
| PL12 | `GET /v2/` (apiv2, sans authentification) | Renvoyait `release` (version déployée) en clair | Renvoie `{ status: "ok" }` |
| PL15 | `GET /v2/campagne/:id` | `getById` appelait `campagneGateway.findById` et levait un `Error` générique sur un ObjectId valide mais inexistant → 500 non catégorisée + événement Sentry à chaque appel | Réutilise `campagneService.findById`, qui lève déjà `FunctionalException(CAMPAIGN_NOT_FOUND)` → 422 sans bruit Sentry (`AllExceptionsFilter` ignore déjà ce statut) |
| PL13 | Origine Clever Cloud d'apiv2 (`apiv2/src/infra/security/HostGuard.ts`) | Contournable en forgeant l'en-tête `Host` sur l'origine Clever | Aucun changement de code : le correctif restant est infrastructure (restreindre l'origine aux IP de sortie du WAF OGo, ou en-tête secret), déjà documenté dans le commentaire du fichier — voir « Après déploiement » |

## 2. Choix

- **ENVIRONMENT devient obligatoire partout, y compris en local** : la seule façon de fermer le
  repli silencieux sur `development` en production est de ne plus l'appliquer nulle part. Seul jest
  garde un défaut implicite (`NODE_ENV === "test"` ⇒ `environment = "test"`), car c'est la seule
  garantie fiable dans ce dépôt (`api/package.json`/`apiv2/package.json` ne positionnent pas
  `NODE_ENV` ailleurs). **Conséquence directe : `npm run dev`/`dev:api`/`dev:tasks` et les scripts
  `migrate-*` de l'api refusent désormais de démarrer sans `ENVIRONMENT` dans le `.env` local** —
  `api/.env-example` a été mis à jour (`ENVIRONMENT=development`), mais les `.env` déjà en place sur
  chaque poste doivent être complétés à la main (voir « Après déploiement »). `apiv2` n'a pas de
  `.env-example` versionné : à documenter au même endroit que le reste de sa configuration locale.
- **Cohérence NODE_ENV/ENVIRONMENT « absent ou égal »**, pas « obligatoirement égal » : `NODE_ENV`
  n'est positionné nulle part sur les postes de développement (`nodemon`) ni sur les apps Clever
  hors CI — l'exiger aurait cassé ces deux cas. La garde ne sert qu'à éviter une incohérence
  explicite (ex. `NODE_ENV=production` avec `ENVIRONMENT=staging`).
- **La garde JWT_SECRET est simplifiée en `environment !== "development" && environment !== "test"`**
  plutôt que d'allonger la liste fermée avec le motif `env-*` : elle devient l'exact complément de la
  condition qui sert `dev-secret`, donc ferme structurellement tout nouvel environnement nommé à
  l'avenir sans qu'il faille penser à mettre à jour deux listes séparées.
- **PM12 ne borne que `searchbar`**, pas les autres filtres du même schéma générique : ce sont des
  facettes à valeurs choisies dans une liste fermée côté front, pas du texte libre — les borner en
  longueur n'aurait aucun effet utile et risquerait de couper une valeur légitime longue (libellé
  d'établissement, par exemple).
- **PL5 utilise un `corsOptionsDelegate`** (une seule instance de middleware `cors()`, options
  choisies dynamiquement par route) plutôt que d'empiler un second `app.use(cors())` après le
  premier : un second middleware CORS monté après le global ne serait jamais atteint sur les
  requêtes preflight `OPTIONS`, le premier y répondant (204) avant de lui laisser la main — piège
  classique de l'empilement de CORS Express. La construction des options est extraite dans
  `api/src/cors-options.js`, testable directement sans monter tout `main.js` (le helper de test
  `api/src/__tests__/helpers/app.ts` ne monte pas `main.js`).
- **PL13 ne comporte aucun changement de code** : la garde d'hôte (`HostGuard.ts`) documente déjà la
  limite dans son commentaire ; le correctif est une action infrastructure (WAF OGo), pas un diff.

## 3. Fichiers touchés

`api/src/config.ts`, `api/.env-example`, `api/src/controllers/elasticsearch/utils.ts`,
`api/src/main.js`, `api/src/cors-options.js` (nouveau), `apiv2/src/config/configuration.ts`,
`apiv2/src/infra/HealthCheck.controller.ts`, `apiv2/src/plan-marketing/infra/api/Campagne.controller.ts`.

Tests : `api/src/__tests__/config-jwt-secret.test.ts`, `api/src/__tests__/elasticsearch-searchbar-length.test.ts`
(nouveau), `api/src/__tests__/cors-origin-v1.test.ts` (nouveau), `apiv2/src/config/configuration.spec.ts`
(nouveau), `apiv2/test/health/HealthCheck.controller.spec.ts`, `apiv2/test/plan-marketing/Campagne.controller.spec.ts`.

## 4. Tests

- `config-jwt-secret.test.ts` (api) et `configuration.spec.ts` (apiv2, nouveau) : mêmes 8-10 cas de
  chaque côté — `JWT_SECRET` manquant en production/recette (échec), en test (ok, `dev-secret`),
  `ENVIRONMENT` absent (échec), mal orthographié (échec), recette `env-<branche>` avec/sans
  `JWT_SECRET` (ok/échec — ferme le contournement), `NODE_ENV` incohérent (échec) ou cohérent (ok),
  `dev-secret` non servi hors `development`/`test` même avec un `ENVIRONMENT` connu (`custom`).
- `elasticsearch-searchbar-length.test.ts` (nouveau) : `joiElasticSearch` accepte 200 caractères,
  rejette 201 ; les autres filtres (facettes) ne sont pas bornés en longueur ; `searchSubQuery`
  génère bien 3 clauses par mot et plafonne à 20 mots retenus sur une chaîne qui en contient 50.
- `cors-origin-v1.test.ts` (nouveau) : `corsOptionsDelegate` unitaire (sans monter `main.js`) —
  `[APP_URL, ADMIN_URL]` avec credentials par défaut ; `SUPPORT_URL`/`SUPPORT_FRONT_URL`/
  `KNOWLEDGEBASE_URL`/hôte mort absents par défaut ; `KNOWLEDGEBASE_URL` sans credentials sur
  `/signin/token` et `/signin/logout` ; `SUPPORT_FRONT_URL` sans credentials sur `/cohort/public`.
- `HealthCheck.controller.spec.ts` (apiv2) : nouveau cas `GET /` — ne renvoie plus `release`.
- `Campagne.controller.spec.ts` (apiv2) : nouveau describe `GET /:id` — campagne trouvée (200) et
  `FunctionalException(CAMPAIGN_NOT_FOUND)` (422, pas 500).
- Suites complètes relancées en série (Node 20, `--maxWorkers=1`), api et apiv2 chacune seule
  (jamais en parallèle) : **api 100 % verte** (117 suites, 1795 tests, 15 skip, 1 todo) ; **apiv2**
  verte à l'exception de 15 suites qui échouent au chargement du module (`Cannot find module
  '@bull-board/nestjs'`) — panne d'isolation du worktree préexistante et sans rapport avec ce lot
  (le paquet est présent, mais mal nommé, dans le checkout principal lui-même :
  `apiv2/node_modules/@bull-board/.nestjs-VR8OZDaX` au lieu de `.../nestjs`) ; les 571 tests
  restants passent. Un premier essai avec les deux suites lancées **en parallèle** en arrière-plan
  avait fait échouer 11 tests de `application.test.ts` (`CastError` sur `mission.tutorId: ""`,
  piège déjà connu — voir `lot-p04-moderation-missions-structures`) : reproduit comme un conflit
  d'accès concurrent au même conteneur `snu-test-mongo` (cf. mémoire projet sur les runners CI),
  pas une régression de ce lot — confirmé en relançant chaque suite seule, deux fois de suite.

## 5. Risque fonctionnel

- **PM7 casse le démarrage local et les scripts `migrate-*`/`dev*` de l'api tant que `ENVIRONMENT`
  n'est pas ajouté au `.env` de chaque poste** (voir « Après déploiement »). Sans effet sur les apps
  Clever si `ENVIRONMENT` y est déjà bien positionné partout (à vérifier avant fusion, cf. ticket).
- **PL5** : un cookie ou une requête `credentials: true` envoyée depuis `SUPPORT_FRONT_URL` ou
  `KNOWLEDGEBASE_URL` vers une route qui n'est ni `/signin/token`, ni `/signin/logout`, ni
  `/cohort/public` serait désormais bloquée par le navigateur — recette sur staging avant prod pour
  confirmer qu'aucun autre appel cross-origin n'existe depuis ces deux fronts.
- **PM12/PL12/PL15** : risque négligeable (limite large, pas d'usage produit connu du champ
  `release`, comportement de PL15 déjà couvert par test).

## 6. Après déploiement

- **Bloquant avant toute mise en production** : vérifier que `ENVIRONMENT` est bien positionné sur
  PROD-SNU-API, PROD-SNU-APIV2, PROD-SNU-TASKS, PROD-SNU-TASKSV2, STAGING-SNU-ALL, CI-SNU-ALL et
  chaque recette `env-*` active — sans quoi ces apps refusent de démarrer et tournent en boucle
  (`clever env` sur chaque app, org `GOUV-SNU`).
- Ajouter `ENVIRONMENT=development` au `.env` local de chaque poste de développement (déjà dans
  `api/.env-example`, mais pas rétroactif sur les `.env` existants) ; documenter la même exigence
  côté `apiv2` (pas de `.env-example` versionné pour l'instant).
- Contrôler la connexion à `/signin/token`/`/signin/logout` depuis la base de connaissance et à
  `/cohort/public` depuis snupport-app après déploiement (CORS dédié PL5).
- PL13 reste ouvert : restreindre l'origine Clever Cloud d'apiv2 aux IP de sortie du WAF OGo, ou lui
  faire vérifier un en-tête secret (action infra, hors code).
