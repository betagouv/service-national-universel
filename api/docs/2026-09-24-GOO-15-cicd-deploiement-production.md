# GOO-15 — CI/CD : protection du déploiement de production

Constats traités : FH19, FH20, FM24, FM25 (en partie), FM26.

## Ce qui change dans le dépôt

- **Jeton GitHub en lecture seule par défaut.** Chaque workflow déclare
  `permissions: contents: read`. Seuls les jobs qui poussent une branche de
  déploiement (`deploy_production`, `deploy` de la CI, anonymisation) et
  semantic-release obtiennent `contents: write`. `write-all` est retiré
  d'env-deploy.
- **Environnements GitHub.** Les jobs qui reçoivent `CLEVER_TOKEN`/`CLEVER_SECRET`
  déclarent un environnement : `production` (déploiement prod, anonymisation),
  `ci` (déploiement de la CI), `recette` (env-deploy, env-stop, env-destroy,
  env-stop-cron).
- **Scripts de recette lus sur la branche par défaut.** env-deploy, env-stop et
  env-destroy exécutent `devops/scripts/*` depuis `main`, plus depuis la branche
  proposée. Une PR qui modifie ces scripts ne les voit donc appliqués qu'après
  son merge.
- **Aucun nom de branche interpolé dans un `run:`.** Il passe par une variable
  d'environnement citée (env-*, run-tests, changelog de prod), et en JSON échappé
  (`toJSON`) vers les actions de test.
- **Installation des dépendances sans scripts en CI.** Les actions `run-tests-*`
  lancent `npm ci --ignore-scripts`, puis rejouent explicitement les deux
  seuls scripts nécessaires : `patch-package` et `copy:dsfr` (app, admin). Le
  checkout n'y conserve plus le jeton Git (`persist-credentials: false`). La
  tentative de novembre 2025 (551ba80be, revertée) ne rejouait pas ces scripts.
- **PR Title Checker** : déclencheur `pull_request` (et non plus
  `pull_request_target`), aucune action tierce, runner hébergé par GitHub,
  configuration lue sur la branche de base. Mêmes règles qu'avant.
- **Versions épinglées.** Actions tierces par SHA ; clever-tools 5.0.2 sur Node 24
  (`actions/setup-node`) dans les workflows, 3.14.0 dans l'image d'anonymisation
  (Node 20) ; turbo à la version exacte du lockfile dans les scripts de build et
  les Dockerfiles (auparavant : dernière 2.x publiée).
- **Ordre du déploiement.** clever-tools est installé avant le force-push : le
  22/09, son échec (npm absent du runner) survenait après le push, et la prod
  partait sans suivi.
- **Recettes.** env-stop et env-destroy ciblent l'application au nom exact :
  `grep -w env-foo` retenait aussi `env-foo-bar`.
- **CODEOWNERS** couvre `.github/`, `devops/scripts/`, `devops/build/` et le
  Dockerfile d'anonymisation.

## Configuration GitHub à faire (hors code)

1. Environnement `production` : relecteurs obligatoires, branche `production`
   seule ; y déplacer les secrets Clever de production.
2. Environnement `ci` : branche `main` seule. Environnement `recette` :
   relecteurs obligatoires ou identifiants Clever distincts, limités aux
   applications `env-*`.
3. Supprimer ensuite `CLEVER_TOKEN`/`CLEVER_SECRET` des secrets du dépôt.
4. Règles de branche (ruleset) sur `production` et `deploy-production` : push
   restreint, avec GitHub Actions seul en contournement pour `deploy-production`
   (le job `deploy_production` y force-pousse).
5. Runners : séparer ou rendre éphémères ceux qui exécutent les déploiements.

Un environnement absent est créé par GitHub au premier run, sans protection :
les workflows fonctionnent avant ces réglages, mais la protection n'existe
qu'après.
