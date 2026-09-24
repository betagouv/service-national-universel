# GOO-17 — collecte des violations de la CSP des fronts (FM27, suite)

Suite de `2026-09-24-GOO-17-entetes-http-sourcemaps-tiers.md`. Vérifié et corrigé le 2026-09-24 sur
`origin/main` @ `a770bfd43` (ticket Linear GOO-17).

## 1. Constat

La politique cible des fronts est servie en `Content-Security-Policy-Report-Only` depuis #5385, mais
sans adresse de collecte : les violations n'apparaissaient que dans la console de l'usager. Rien ne
permettait donc de savoir quand la politique pouvait passer en mode bloquant, et FM27 restait ouvert
sans échéance.

## 2. Correctif

| Où | Changement |
| --- | --- |
| `devops/build/csp-report.sh` (nouveau) | `csp_report_uri <application>` lit le DSN dans `<application>/src/sentry.js` et en tire l'adresse de l'endpoint « security » du projet Sentry du front (admin 241, app 244, snupport-app 246), étiquetée avec `VITE_ENVIRONMENT` et `VITE_RELEASE` ; échoue si le DSN est introuvable ou ambigu |
| `devops/build/build.sh` | `CSP_REPORT_URI` calculée pour le front construit et passée à `envsubst` |
| `devops/build/build-all.sh` | `CSP_REPORT_URI_APP` et `CSP_REPORT_URI_ADMIN` pour les deux serveurs des recettes |
| `devops/build/front/nginx.conf`, `devops/build/all/nginx.conf` | `report-uri` ajoutée à la politique Report-Only |

## 3. Choix

- **Une adresse par application, calculée au build.** L'en-tête nginx est commun aux trois SPA alors
  que leurs projets Sentry sont distincts : la variable est substituée par `envsubst`, comme `$PORT`.
- **DSN lu dans `src/sentry.js`.** C'est celui déjà embarqué dans chaque bundle : aucun secret nouveau
  n'est exposé, les clés ne sont pas recopiées (gitleaks les signalerait), et un changement de projet
  Sentry suit sans toucher au script de build.
- **`report-uri` seule, sans `report-to`.** Tous les navigateurs lisent `report-uri` (Firefox
  n'applique pas `report-to` à la CSP), et Chrome la suit tant que `report-to` est absent. Cela évite
  aussi de dépendre de la prise en charge du format `application/reports+json` par l'instance Sentry
  auto-hébergée.
- **Politique appliquée inchangée.** Les directives déjà bloquantes (`frame-ancestors`, `base-uri`,
  `object-src`) ne reçoivent pas d'adresse de collecte : l'objectif est l'observation de la politique
  cible avant sa bascule.
- **KB hors périmètre.** Sentry y est désactivé (`enabled: false`) et son DSN vient de l'environnement :
  il n'y a pas de projet vers lequel envoyer les rapports.

## 4. Suites

- Après déploiement : vérifier que des événements « CSP » arrivent dans les projets Sentry 241, 244
  et 246, et filtrer le bruit des extensions navigateur (`blocked-uri` en `chrome-extension:`,
  `moz-extension:`).
- Après une période d'observation sans violation légitime : passer la politique en
  `Content-Security-Policy` (FM27).

## 5. Vérifications

- `bash -n` sur les trois scripts.
- Rendu `envsubst` des deux `nginx.conf` : `report-uri` substituée par application, `$uri` de nginx
  intact ; un DSN introuvable fait échouer `csp_report_uri` et arrête le build (`set -e`).
- `nginx -t` (image `nginx:stable`) sur les deux configurations rendues : OK.
- nginx lancé sur la configuration front rendue : l'en-tête `Content-Security-Policy-Report-Only`
  servi se termine par l'adresse Sentry attendue.
- L'acceptation des rapports par `sentry.incubateur.net` n'a pas été testée (pas d'envoi vers un
  service externe depuis le poste) : à contrôler au premier déploiement.
