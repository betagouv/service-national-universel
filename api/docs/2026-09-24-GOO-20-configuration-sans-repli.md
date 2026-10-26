# GOO-20 — configuration des fronts sans repli silencieux

Audit des fronts du 2026-09-23 (chantier transverse, observations de l'annexe B). Vérifié et corrigé
le 2026-09-24 sur `origin/main` @ `9a50ebc53` (ticket Linear GOO-20).

## 1. Constats et correctifs

| Point | Où | Défaut | Correctif |
| --- | --- | --- | --- |
| `VITE_ENVIRONMENT` | `app/`, `admin/`, `snupport-app/` : `src/config.ts` et `vite.config.js` | variable absente au build → `environment` retombait sur `"development"` : Sentry coupé, bandeau « DEV », fonctions réservées hors production (déplacements de lignes de bus, pied de page de support) réactivées | `vite build` échoue si `VITE_ENVIRONMENT` est absent ; le repli `"development"` n'est plus servi que par le serveur de dev (`import.meta.env.DEV`) |
| `JWT_SECRET` snupport-api | `snupport-api/src/config.ts` | repli sur `"my-secret"` hors dev/test | déjà corrigé par #5384 (lot R1, L47) : démarrage refusé si absent hors `development`/`test` ; rien à changer |

## 2. Choix

- **Garde au build, pas seulement à l'exécution.** Le script de build passe déjà
  `--mode "$VITE_ENVIRONMENT"` : une variable vide donnait un mode par défaut et un bundle « development »
  sans erreur. La garde vit dans `vite.config.js` (`command === "build"`), elle lit la variable via
  `loadEnv` : un `.env` local qui la définit suffit.
- **Pas de liste fermée de valeurs.** Les recettes utilisent des noms dérivés de la branche ; seule
  l'absence est refusée.
- **La CI n'est pas concernée** : elle type-check et lint les fronts sans les construire.

## 3. Hors périmètre / suites

- **snupport-api** : `ENVIRONMENT` absent retombe toujours sur `"development"` (Sentry coupé, `.env`
  chargé). Le poste de dev s'appuie sur ce repli (pas de `.env-example`, `nodemon` sans variable) : le
  durcir demande de fixer la convention de démarrage local.
- **Bucket `cni-bucket-prod`** (référencé en dur dans app et admin) : vérifier sur Cellar que l'accès
  public est limité aux documents publics, sans listing, et distinct du stockage privé des pièces
  d'identité. Vérification d'infrastructure, hors code.
- **Avant déploiement** : confirmer que `VITE_ENVIRONMENT` est défini sur chaque application front de
  Clever Cloud (prod, staging, recettes), sinon le build échouera.
