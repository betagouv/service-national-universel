# Lot T1 — api v1 : moniteur de tâches, endpoints techniques, configuration (M12, L7, L26, L30, L31)

Date : 2026-09-24 · Audit sécurité des API du 21/09/2026 · Ticket Linear GOO-36 · Branche `fix/goo-36-lot-t1-api-v1`, base `origin/main` (`84b8e151b`)

## État des constats sur `origin/main`

Les cinq constats ont été relus sur le code courant avant correction ; tous étaient encore ouverts.

## Ce qui change

| Id  | Où                                                                                                                                        | Avant                                                                                                                                                 | Après                                                                                                                                                                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M12 | `api/src/mainJob.js`, `config.ts`                                                                                                         | Bull Board (app tasks) servi à la racine ; l'authentification basique n'était posée que si `TASK_MONITOR_ENABLE_AUTH=true`, `false` par défaut        | la variable `TASK_MONITOR_ENABLE_AUTH` est supprimée. Bull Board n'est monté que derrière l'authentification basique, et seulement si `TASK_MONITOR_USER` **et** `TASK_MONITOR_SECRET` sont renseignés. Sinon, il n'est pas servi : `/` répond `SNU tasks`, `/healthcheck` reste inchangé   |
| L31 | `api/src/main.js`                                                                                                                         | `/memory-stats`, `/testsentry`, `/error_for_baleen` publics partout, `/test_error_double_res_send` et `/test_error_crash_app` publics hors production | routes supprimées (404). `GET /` et `/healthcheck` sont conservés pour les sondes                                                                                                                                                                                                           |
| L30 | `api/src/main.js` → `middlewares/httpHardening.ts`                                                                                        | `json`, `text` (ndjson) et `urlencoded` acceptaient 50 Mo sur toutes les routes, y compris anonymes                                                   | plafond de 1 Mo, au-delà : 413 `PAYLOAD_TOO_LARGE`. Les fichiers passent par `express-fileupload` (multipart, plafond propre à chaque route, 5 à 10 Mo) et ne sont pas concernés                                                                                                            |
| L26 | `api/src/cookie-options.js`                                                                                                               | `SameSite=Lax` en production, staging et CI                                                                                                           | `SameSite=Strict`. Les fronts (admin, moncompte, support, KB) sont sur le même site que l'API (`snu.gouv.fr`, `beta-snu.dev`), leurs appels restent same-site. Les recettes (`custom`, domaines distincts) restent en `None`. Le cookie `jwtzamoud` (SSO support) garde son `Lax` explicite |
| L7  | gestionnaire d'erreurs global (`main.js`)                                                                                                 | `{ error: { name, message, text } }` : message Mongo, body-parser, passport renvoyé tel quel                                                          | `{ ok: false, code }`, code stable tiré du statut HTTP (`BAD_REQUEST`, `OPERATION_UNAUTHORIZED`, `NOT_FOUND`, `PAYLOAD_TOO_LARGE`, `SERVER_ERROR`…). Le détail reste dans Sentry (`setupExpressErrorHandler`) et le nom de l'erreur est loggé pour les 5xx                                  |
| L7  | `cohort` (5 routes), `equivalence` (4), `young/phase1` (5), `young/phase2`, `young/index`, `mission`                                      | objet d'erreur Mongo/Joi (ou `error.details`) joint à la réponse                                                                                      | code seul                                                                                                                                                                                                                                                                                   |
| L7  | routes `…/patches` (application, contract, mission, structure, classe), `cle/classe`, `cle/referent/getMany`, imports centres et sessions | `code: error.message` sur un 500/422 : tout message d'exception (Mongo, réseau) partait au client                                                     | `toErrorCode(error)` (`utils/errorCode.ts`) : garde un code métier (constante en majuscules levée par les services), remplace tout autre message par `SERVER_ERROR`                                                                                                                         |
| L7  | `snupport-api` `validationErrorHandler`                                                                                                   | `error: error.toString()` (message Joi, recopie les valeurs reçues)                                                                                   | code `VALIDATION_ERROR` seul                                                                                                                                                                                                                                                                |

Le test d'application (`__tests__/helpers/app.ts`) utilise désormais les mêmes analyseurs de corps et le même
gestionnaire d'erreurs que `main.js` (module partagé `middlewares/httpHardening.ts`).

## Vérification (Node 20, en série)

| Contrôle                                                                                                                                                                                                 | Résultat                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `api` — `lot-t1-hygiene-api` (nouveau)                                                                                                                                                                   | 17/17 ; sur le code d'`origin/main`, les cas L26 et `/cohort/public` échouent |
| `api` — suites voisines (cohort, mission, equivalence, contract, structure, application, classe CLE, centres, sessions phase 1, auth jeune/référent, `sessions-goo-16`, snupport, lot T2, patches jeune) | 24 suites, 490/490 (10 ignorés)                                               |
| `snupport-api` — suite complète                                                                                                                                                                          | 42 suites, 397/397                                                            |

`GET /memory-stats` → 404 ; corps de 2 Mo sur `POST /young/signin` → 413 `{ ok: false, code: "PAYLOAD_TOO_LARGE" }` ;
erreur Mongo sur `GET /cohort/public` → `{ ok: false, code: "SERVER_ERROR" }`.

## Actions de déploiement

- **PROD-SNU-TASKS, PROD-SNU-TASKSV2, staging et recettes** : vérifier que `TASK_MONITOR_USER` et `TASK_MONITOR_SECRET` sont
  renseignés si le moniteur doit rester accessible. Sans eux, il n'est plus servi (fermeture par défaut). La variable
  `TASK_MONITOR_ENABLE_AUTH` peut être retirée : elle n'est plus lue.
- Après déploiement : vérifier une connexion admin et moncompte en production (cookie `SameSite=Strict`), ainsi que le
  retour SSO depuis JeVeuxAider (`/jeveuxaider/signin` → admin).
- La redaction des logs (#5293) est sur `main` : vérifier qu'elle est déployée sur `production` avant de fermer le lot.
  Au 24/09, la production était arrêtée avant #5316.

## Hors périmètre / à surveiller

- Les réponses d'erreur des imports plan marketing et points de rassemblement (`message: error.message`) relèvent du lot L3 (GOO-35).
- `POST /cle/referent/getMany` renvoie encore `Referents not found: <ids>` en 404 : ce sont les identifiants envoyés par l'admin, rien de plus.
- Le domaine parent des cookies (`.snu.gouv.fr`) est conservé ; un cookie limité à l'hôte de l'API reste à l'étude (GOO-16).
- Si un client légitime envoie un corps JSON de plus de 1 Mo (sélection de plusieurs dizaines de milliers d'identifiants),
  il recevra un 413 : relever alors le plafond sur cette route seulement.
