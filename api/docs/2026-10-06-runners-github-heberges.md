# Workflows sur runners hébergés par GitHub uniquement

Suite du lot P21 (`2026-09-26-lot-P21-cicd-deploiement-production.md`), constat
PM62, resté fermé en partie : les jobs qui portent des secrets (déploiement de
production, anonymisation, recettes) pouvaient tourner sur le pool de runners
auto-hébergés du dépôt, partagé avec les jobs de test des branches.

## Ce qui change dans le dépôt

- **`runs-on: ubuntu-latest` partout.** Les workflows lisaient
  `vars.SNU_RUNNER || 'ubuntu-latest'` : une variable d'organisation suffisait à
  renvoyer tous les jobs, y compris `deploy_production` et `anonymize`, vers un
  runner auto-hébergé. La variable n'est plus lue.
- Workflows concernés : anonymize-cron, env-deploy, env-destroy, env-stop,
  env-stop-cron, run-tests, test-deploy-ci, test-deploy-production.
  pr-title-checker était déjà sur `ubuntu-latest` depuis P21.

## Configuration GitHub

Les trois runners auto-hébergés du dépôt (`snu-ci-4`, `snu-do-1`, `snu-r2-1`),
hors ligne, ont été désinscrits le 06/10/2026. Les derniers runs passaient déjà
sur `ubuntu-latest` : aucun changement de comportement attendu.
