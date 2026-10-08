# CI : build de production de chaque application sur les PR vers main

Suite de `2026-10-08-builds-production-support-api-et-suivi-deploiements.md` (PR #5497). Deux
régressions du build de production ont atteint la branche `production` sans qu'aucun job ne les
signale : les tests tournent dans le monorepo complet, alors que Clever Cloud construit chaque
application dans l'arbre élagué par `turbo prune`. Une dépendance implicite entre workspaces
passe dans le premier et casse dans le second :

1. **snupport-api** : turbo 2.0.14 (jusqu'à 2.8) n'emportait pas dans le lockfile élagué les
   paquets atteints seulement par une peerDependency (`@tanstack/react-query`, peer de
   `snu-lib`) → `npm ci` : « Missing … from lock file ».
2. **api** (et les tâches, même build) : `req.files` ne compilait dans le monorepo que grâce à
   `@types/multer`, devDependency d'apiv2 incluse automatiquement depuis `node_modules/@types` ;
   `turbo prune api` l'écarte → TS2339 dans `middlewares/tempUpload.ts`.

Le déploiement de l'environnement CI après fusion (`build-all.sh`) ne les aurait pas arrêtées
non plus : il élague app, admin, api et apiv2 ensemble, si bien que `@types/multer` reste dans
l'arbre (vérifié : présent à la racine du lockfile élagué, absent de celui de `api` seul), et il
ne construit pas le support.

## Ce qui change dans le dépôt

Nouveau workflow `.github/workflows/build-production.yml` (« Build de production ») :

- **Sur chaque PR vers `main`**, un job par application déployable (api, apiv2, app, admin,
  snupport-api, snupport-app) lance `devops/build/build.sh <app> /tmp/build-<app>`, le script
  même que Clever Cloud exécute au déploiement : `turbo prune`, `npm ci` et `turbo run build`
  dans l'arbre élagué, puis assemblage de l'artefact. La version de turbo est celle du lockfile,
  installée globalement par le script sur le runner éphémère. Les tâches (build `api`) et
  tasksv2 (build `apiv2`) sont couvertes par ces deux jobs.
- **État construit** : le commit de fusion de la PR dans `main`, c'est-à-dire ce que la fusion
  produirait au moment du run.
- **Filtrage par chemins**, comme les autres workflows : une application n'est construite que si
  la PR touche `package.json`, `package-lock.json`, `turbo.json`, `devops/build/`, `packages/`,
  ce workflow, ou ses propres chemins (`api/` et `patches/` pour l'api, `apiv2/` et `patches/`
  pour apiv2, `app/` ou `admin/` et `tsconfig.front.json` pour app et admin, `snupport-api/`,
  `snupport-app/`). Ces listes couvrent tout ce que `turbo prune` emporte : l'application, des
  `packages/*` et, à la racine, `package.json`, `package-lock.json` et `turbo.json`. Sinon le
  job passe sans construire et l'annonce (`::notice::`) : le nom du check reste stable, il peut
  être rendu obligatoire.
- **`fail-fast: false`** : un échec n'interrompt pas les autres builds.
- **Lancement manuel** (`workflow_dispatch`) : construit les six applications.
- **Conditions d'exécution** : `pull_request` (jamais `pull_request_target`), jeton
  `contents: read`, `persist-credentials: false`, aucun secret, `runs-on: ubuntu-latest`,
  actions épinglées par SHA, Node 20 (dernière 20.x, comme l'image Clever),
  `VITE_ENVIRONMENT=ci` pour les fronts. `CC_DEPLOYMENT_ID` n'est pas défini : le script ne vide
  pas le répertoire de travail. Sans `SENTRY_AUTH_TOKEN`, le plugin Sentry de vite n'envoie rien.
- **Scripts d'installation** : `npm ci` les exécute, comme au déploiement (contrairement à
  `setup-workspace`, qui passe `--ignore-scripts`). Le job exécute de toute façon le code de la
  PR (configurations vite, compilation) ; il le fait sur un runner éphémère, sans secret ni jeton
  en écriture.

## Vérifié

Le job rejoué en local dans les conditions du runner : copie propre de l'arbre (`git archive`),
Node 20.20.2 / npm 10.8.2, turbo installé dans un préfixe npm propre au build,
`VITE_ENVIRONMENT=ci`, ni `CC_DEPLOYMENT_ID` ni `SENTRY_AUTH_TOKEN`.

- **`main` au 08/10 (6569e3f), qui porte encore les deux régressions** : apiv2, app, admin et
  snupport-app construits ; snupport-api et api en échec (code de sortie 1) avec les erreurs
  relevées dans les journaux Clever par #5497 — « Missing: @tanstack/react-query@5.104.1 from
  lock file » sous turbo 2.0.14, et les trois TS2339 de `tempUpload.ts`.
- **`main` + correctifs de #5497** : les six applications construites (1 min 30 à 3 min 15
  chacune en local, cache npm chaud). Artefact du support : `@tanstack/react-query` 5.29.2.
- **Régression 2 seule** : arbre corrigé (turbo 2.11.5) où seul `tempUpload.ts` reprend sa
  version sans type local → build `api` en échec sur les trois TS2339. Le job l'aurait arrêtée
  indépendamment de la version de turbo.
- **Filtrage par chemins** : étape extraite du YAML et rejouée sur des commits de fusion
  simulés, récupérés comme le fait `actions/checkout` (`fetch --depth=2` du commit de fusion,
  dépôt superficiel de trois commits). `snupport-app/` seul → snupport-app ; `api/` (y compris
  `api/docs/`) → api ; `apiv2/` + `app/` → apiv2 et app ; `tsconfig.front.json` → app et
  admin ; `patches/` → api et apiv2 ; `packages/`, `package-lock.json`, `devops/build/` ou ce
  workflow → les six ; `README.md` ou `run-tests.yml` → aucune ; lancement manuel → les six.
  Avec un historique trop court (`--depth=1`), les six jobs échouent
  (`bad revision 'HEAD^1'`) au lieu de sauter le build.
- actionlint (avec shellcheck) propre.

## Limites

- Le job vérifie que l'artefact se **construit**, pas qu'il **démarre** : un paquet manquant à
  l'exécution seulement (`MODULE_NOT_FOUND` au boot) n'est pas détecté.
- Le build porte sur la fusion avec `main` au moment du run : deux PR vertes chacune peuvent
  encore casser le build une fois fusionnées l'une après l'autre, et rien ne relance
  `build.sh` application par application après la fusion.
- Le check n'est pas obligatoire tant que les noms `build (<app>)` ne sont pas ajoutés aux
  vérifications requises de la branche `main`.
