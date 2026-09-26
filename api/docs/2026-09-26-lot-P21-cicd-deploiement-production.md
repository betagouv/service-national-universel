# Lot P21 — CI/CD : protection du déploiement de production

Audit de sécurité de la production du 25/09/2026, constats PH27, PH29 (élevée), PM56, PM61, PM62
(moyenne) (ticket Linear GOO-69). Ces constats reprennent, avec de nouveaux identifiants, ceux d'un
audit antérieur (GOO-15 : FH19, FH20, FM24, FM25, FM26) déjà corrigés dans la PR #5380, ouverte depuis
le 24/09/2026 mais jamais fusionnée. Vérifiés encore ouverts le 2026-09-26 sur `origin/main`, puis
fermés par rebase du commit unique de #5380 (`7b05df301`, sans conflit) sur `main` à jour.

## 1. Correctifs

| Constat | Surface | Correctif |
| --- | --- | --- |
| PH27 | `.github/workflows/env-deploy.yml` (déploiement d'environnement de test depuis une PR) | jeton par défaut `contents: read` (`write-all` retiré) ; job `deploy` sous l'environnement GitHub `recette` (secrets Clever protégés par relecteurs) ; checkout et exécution de `devops/scripts/cc-create-environment.sh` sur la branche par défaut (`persist-credentials: false`), jamais sur la branche de la PR ; `BRANCH_NAME`/`SHA` passés en variable d'environnement plutôt qu'interpolés dans un `run:` ; `CODEOWNERS` étendu à `/.github/`, `/devops/scripts/`, `/devops/build/` et au Dockerfile d'anonymisation (au lieu des seuls `*.yml`) |
| PH29 | `.github/workflows/test-deploy-production.yml` (job `deploy_production`) et `anonymize-cron.yml` (job `anonymize`) | jeton par défaut `contents: read` sur tout le workflow ; seul le job qui force-pousse (`deploy-production` / `anonymization`) reçoit `contents: write`, sous l'environnement GitHub `production` (relecteurs obligatoires) ; `persist-credentials: false` sur les checkouts qui ne poussent pas (`prepare`, `test`, `changelog`) |
| PH29 (vecteur postinstall) | `.github/actions/run-tests-{api,apiv2,app,admin,lib}/action.yml` | `npm ci --ignore-scripts`, puis rejeu explicite des deux seuls postinstall du monorepo : `patch-package` (racine) et `npm run copy:dsfr --workspace app --workspace admin` — ferme le vecteur où un paquet npm compromis exécuterait du code dans un job qui garde encore le jeton Git |
| PM56 | `devops/build/build.sh`, `build-all.sh`, `docker/Dockerfile.back`, `docker/Dockerfile.front` | version de `turbo` lue dans la résolution du lockfile (`require('./package-lock.json').packages['node_modules/turbo'].version`) au lieu d'un grep sur la plage semver de `package.json` (qui installait la dernière 2.x publiée, pas la version auditée) ; `--ignore-scripts` sur l'installation globale de `turbo` et de `clever-tools` (5.0.2 sous Node 24 dans les workflows, 3.14.0 sous Node 20 dans l'image d'anonymisation, dernière version compatible) |
| PM61 | `.github/workflows/pr-title-checker.yml` | déclencheur `pull_request` au lieu de `pull_request_target` (plus de contexte base ni de secrets pour du code de fork) ; action tierce `thehanimo/pr-title-checker@v1.4.1` retirée au profit d'un contrôle `jq` inline qui ne lit que `.github/pr-title-checker-config.json`, via un checkout sparse sur la SHA de base ; `runs-on: ubuntu-latest` au lieu de `vars.SNU_RUNNER` |
| PM62 | idem + tous les workflows | `pr-title-checker` sort du pool de runners auto-hébergés partagés (`ubuntu-latest`) ; **fermé en partie seulement** — `env-deploy`, `run-tests-*`, `test-deploy-production` et `anonymize-cron` restent sur `vars.SNU_RUNNER`, un sujet d'infrastructure (runners éphémères/dédiés) hors d'atteinte d'une PR de code sur ce dépôt |
| — (durcissement additionnel) | tous les workflows/actions modifiés | actions tierces épinglées par SHA (`peter-evans/find-comment`, `peter-evans/create-or-update-comment`, `jenseng/dynamic-uses`, `slackapi/slack-github-action`, `supercharge/mongodb-github-action`) ; noms de variable cités (`"$BRANCH_NAME"`) plutôt qu'interpolés ; `env-stop`/`env-destroy` comparent le nom d'environnement à l'exact plutôt que par `grep -w` (évitait de cibler aussi `env-foo-bar` en cherchant `env-foo`) |

## 2. Choix

- Rebase du commit unique `7b05df301` de #5380 plutôt que fusion de la branche : celle-ci a 27 commits
  de retard sur `main` et charrie un diff parasite (retrait de `csp-report.sh`) dû uniquement à son
  ancienneté. `git merge-tree` confirme un rebase sans conflit sur `main` du 26/09 (après #5420) ; le
  diff obtenu (369 insertions, 73 suppressions, 25 fichiers) correspond exactement à celui mesuré à
  l'ouverture de #5380, sans le bruit de `csp-report.sh`.
- `pr-title-checker-config.json` n'est pas modifié par ce lot : le script inline le relit tel qu'il est
  aujourd'hui sur `main` (scope `devops` ajouté depuis par #5419/GOO-95) — vérifié en rejouant le script
  contre la configuration actuelle avec plusieurs titres (conforme, non conforme, non conforme mais
  avec un label d'exemption).
- Le "jeton Clever distinct limité aux applications `env-*`" que recommande le correctif de PH27 n'est
  pas dans le code : un secret d'environment `recette` du même nom prend le pas sur le secret de dépôt
  sans changement de code, mais il faut le créer manuellement après fusion (section 4).
- PM62 n'est fermé qu'en partie par choix : sortir tous les jobs à secrets du pool de runners partagés
  est un sujet d'infrastructure séparé, pas une PR de code sur ce dépôt.

## 3. Impact fonctionnel

Aucun pour les usagers : ce lot ne modifie que le mécanisme CI/CD (aucun fichier applicatif api,
apiv2, app, admin, lib). Les déploiements de production et l'anonymisation demandent désormais
l'approbation d'un relecteur sur l'environnement GitHub correspondant — à annoncer à l'équipe avant
fusion, sous peine de bloquer le prochain déploiement en attente d'une validation que personne
n'attend. `clever-tools` est épinglé (5.0.2, 3.14.0 pour l'anonymisation) : à valider au premier
déploiement réel après fusion.

## 4. Avant fusion (bloquant)

Un `environment:` référencé dans un workflow sans configuration préalable est créé par GitHub **sans
aucune protection** au premier run. Je n'ai pas créé ces réglages (changement de paramètres du dépôt
GitHub, hors du périmètre que je peux modifier de façon autonome) — à faire par un mainteneur avant de
fusionner cette PR :

1. Créer les environnements GitHub `production`, `recette` et `ci`, chacun avec relecteurs
   obligatoires. `production` restreint à la branche `production` ; `ci` à `main`.
2. Poser un ruleset de branche sur `production`, `deploy-production` et `anonymization` : push
   restreint, avec GitHub Actions seul en contournement pour le job `deploy_production` /
   `anonymize` qui y force-pousse.

Point vérifié sans suite à donner : ce commit retire `CC_TEST_REPORTER_ID` de l'appel à
`run-tests-*` depuis `test-deploy-production.yml`. Sans effet — l'unique consommateur de cet input
dans `run-tests-api/action.yml` (`paambaati/codeclimate-action`) est déjà commenté, et aucun autre
workflow ne le référence.

## 5. Après déploiement

- Faire tourner `CLEVER_TOKEN` et `CLEVER_SECRET` du dépôt : tout collaborateur a pu les lire tant que
  `env-deploy` tournait avec `write-all` et sans environnement protégé.
- Créer un jeton Clever distinct, limité aux applications `env-*`, et le poser en secret de
  l'environment `recette` plutôt que dans les secrets du dépôt.
- Vérifier qu'aucune modification suspecte de `CC_PRE_BUILD_HOOK` ou `CC_CUSTOM_BUILD_TOOL` n'a eu
  lieu sur les applications de production pendant la fenêtre où les secrets étaient largement
  accessibles.
- PM62 (suivi séparé, hors périmètre code) : sortir les jobs à secrets du pool de runners
  auto-hébergés partagé avec des déclencheurs non fiables.
