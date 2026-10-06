# Secrets Clever de recette et de CI réservés à `main`

Suite de GOO-15 (`2026-09-24-GOO-15-cicd-deploiement-production.md`), point 2 de
la configuration GitHub : les environnements `recette` et `ci` portent des
identifiants Clever, mais aucune règle de branche ne les protégeait. Tout job
qui déclarait `environment: recette`, depuis n'importe quelle branche du dépôt,
les recevait.

## Ce qui change dans le dépôt

- **Workflows de recette toujours lus sur `main`.** env-deploy et env-stop
  passent de `pull_request` à `pull_request_target`. Avec `pull_request`, le
  fichier de workflow vient de la PR et la ref évaluée est `refs/pull/N/merge` :
  autoriser cette ref revenait à servir les secrets à toute PR, workflow
  modifié compris. Avec `pull_request_target`, le workflow est celui de `main`
  et la ref évaluée est `main`. Le code de la PR n'est jamais extrait : les
  scripts viennent déjà de la branche par défaut, et Clever construit la
  branche lui-même.
- **PR de fork exclues** d'env-deploy et d'env-stop
  (`head.repo.full_name == github.repository`) : `pull_request_target` leur
  servirait les secrets.
- **Déclenchement manuel par saisie.** env-deploy, env-stop et env-destroy se
  lancent depuis `main` avec un champ `branch`, au lieu de se lancer depuis la
  branche visée. env-deploy résout alors le commit de tête par correspondance
  exacte de la ref.
- **Concurrence d'env-deploy par branche de PR.** Sous `pull_request_target`,
  `github.ref_name` vaut `main` pour toutes les PR : le groupe se calcule
  désormais sur la branche de tête, sinon deux recettes s'annuleraient.
- **Commentaire « Application endpoints »** limité aux runs de PR : en
  déclenchement manuel, l'étape partait sans numéro de PR.

## Configuration GitHub (après merge)

Environnements `recette` et `ci` : règle de branche personnalisée, `main`
seule. À poser **après** le merge : avant, les runs `pull_request` encore lus
sur l'ancien workflow seraient refusés.

`delete` et `schedule` s'exécutent sur la branche par défaut, `push` de la CI
sur `main` : env-destroy, env-stop-cron et test-deploy-ci passent la règle sans
modification.
