# Builds de production rétablis (support, api, tâches) et suivi des déploiements

Constaté le 08/10/2026 sur Clever Cloud : depuis le 05/10, PROD-SUPPORT-API échoue à chaque
déploiement ; depuis le 06/10, PROD-SNU-API et PROD-SNU-TASKS aussi (même build `api`). Les
instances en service restaient celles du 28/09 (support) et du 05/10 (api, tâches). Le job
`deploy_production` restait vert. Trois causes distinctes, corrigées chacune dans son commit.

## 1. Build du support : `turbo prune` perdait les peerDependencies

- **Cause.** Le lot P21 (constat PM56, `2026-09-26-lot-P21-cicd-deploiement-production.md`) fait
  installer au build la version de turbo résolue dans le lockfile, 2.0.14, au lieu de la dernière
  2.x publiée. Or `turbo prune` n'emporte pas dans le lockfile élagué, jusqu'à la 2.8, les paquets
  atteints seulement par une peerDependency. `@tanstack/react-query` est une peerDependency de
  `snu-lib` ; npm l'installe et exige donc sa présence dans le lockfile : `npm ci` échouait
  (« Missing: @tanstack/react-query@5.104.1 from lock file »). api et apiv2 déclarent ce paquet en
  dépendance directe et ne sont pas concernés ; snupport-api ne le déclare pas.
- **Correctif.** turbo 2.11.5 dans `package.json` (`^2.11.5`) et le lockfile (paquets de
  plateforme renommés `@turbo/*`). C'était la version `latest` lors du dernier build réussi du
  support (28/09, 08:27Z). PM56 reste en place : la version installée est toujours celle du lockfile.
- **Vérifié.** Reproduit en local avec les versions de l'image Clever (Node 20.20.2, npm 10.8.2) :
  même erreur avec 2.0.14 ; lockfile élagué complet à partir de 2.9.0 (2.8.0 encore incomplet).
  `devops/build/build.sh` passe avec 2.11.5 pour snupport-api (artefact : `@tanstack/react-query`
  5.29.2, `file-type` 21.3.4), apiv2, app, admin et snupport-app.

## 2. Build de l'api : `req.files` typé par un paquet d'apiv2

- **Cause.** `express-fileupload` n'a pas de types installés. Dans le monorepo, `Request.files`
  existe pourtant pour TypeScript : `@types/multer`, dépendance de développement d'apiv2, est
  inclus automatiquement depuis `node_modules/@types` à la racine. `turbo prune api` écarte apiv2,
  donc ce paquet ; `tsc -b` échouait sur les trois lectures de `req.files` de
  `middlewares/tempUpload.ts` (ajouté le 05/10), seul fichier qui les fait sans type local.
- **Correctif.** `tempUpload.ts` lit `files` avec son propre type, comme `UserRequest`
  (`controllers/request.ts`) le fait déjà pour les contrôleurs. Changement de typage seul :
  le JavaScript produit lit toujours `req.files`.
- **Vérifié.** `tsc` passe dans l'arbre élagué (build `api` 3/3) et dans le monorepo ; eslint,
  prettier propres.

## 3. Suivi des déploiements : le job restait vert sur un échec

- **Cause.** L'étape « Watch deployments » de `test-deploy-production.yml` lançait un
  `cc-watch-deploy.sh` par application en arrière-plan puis `wait` sans argument, qui renvoie
  toujours 0.
- **Correctif.** Chaque suivi est attendu par son PID ; le job échoue et nomme l'application dès
  qu'un déploiement n'aboutit pas. Les suivis restent parallèles.
- **Vérifié.** Étape extraite du YAML et rejouée sous `bash -eo pipefail` avec un suivi simulé :
  l'ancienne version sort en 0 malgré des échecs, la nouvelle en 1 avec les applications en
  échec ; 8 suivis de 2 s se terminent en 2 s. actionlint propre sur l'étape.

## Après fusion

- Le premier déploiement de production après fusion redéploie le support, l'api et les tâches,
  avec les correctifs fusionnés depuis le 28/09 (support) et le 05/10 (api, tâches). Vérifier
  l'état `OK` et le commit des instances côté Clever, pas seulement le run GitHub.
- `cc-watch-deploy.sh` sort aussi en erreur quand il ne peut pas lire l'API Clever (`set -e`) : un run rouge
  peut désormais venir d'un suivi interrompu, à distinguer d'un déploiement en échec dans les
  journaux du job.
