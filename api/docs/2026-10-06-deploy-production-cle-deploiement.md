# `deploy-production` : seule la clé de déploiement peut y écrire

Suite de GOO-15 (`2026-09-24-GOO-15-cicd-deploiement-production.md`), point 4
de la configuration GitHub, constats PH27 et PH29 (G24, GOO-150). Clever Cloud
déploie la production à chaque mouvement de `deploy-production`. Le seul
ruleset sur cette branche interdisait sa suppression : une poussée directe,
depuis n'importe quel compte en écriture, déployait sans passer par les tests
complets ni par l'approbation de l'environnement `production`.

## Ce qui change dans le dépôt

- **Le job `deploy_production` pousse avec une clé de déploiement SSH**
  (`DEPLOY_PRODUCTION_SSH_KEY`), passée à `actions/checkout` par `ssh-key`.
  La clé est un secret de l'environnement `production` : elle n'est servie
  qu'après approbation, et seulement aux branches que cet environnement
  accepte (`production`, `deploy-production`, `anonymization`).
- **Jeton GitHub du job en lecture seule** (`contents: read` au lieu de
  `write`) : il ne sert plus à pousser.

## Configuration GitHub

- Clé de déploiement en écriture `deploy-production (job deploy_production,
  env production)`, créée le 06/10/2026 ; partie privée uniquement dans le
  secret d'environnement, aucune copie conservée.
- Ruleset `restrict-deploy-production` : règle « restreindre les mises à
  jour » sur `deploy-production`, seules les clés de déploiement en exception.
  GitHub n'accepte pas l'application GitHub Actions comme exception d'un
  ruleset de ce dépôt, d'où la clé. Le ruleset est créé **désactivé** : à
  activer seulement une fois ce workflow arrivé sur `production` et un
  déploiement réussi avec la clé. Le workflow est lu sur `production` ;
  l'activer avant bloquerait la poussée de l'ancien job.

## Limite

Un compte administrateur peut encore pousser sur `production` un workflow
modifié qui lit la clé, puis approuver lui-même son run. Ce chemin ne se ferme
qu'avec une PR obligatoire sur `production` et `prevent_self_review` sur
l'environnement `production`.
