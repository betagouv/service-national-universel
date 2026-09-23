# GOO-9 — redirection après connexion : `isValidRedirectUrl` (FH18)

Date : 2026-09-23 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`d0a9ab330`)

Le constat a été relu sur le code courant avant correction : confirmé. Toute valeur qui ne commençait
ni par `http(s)://` ni par `//` était acceptée (`javascript:…`, `data:…`, `/\hôte`), et la regex des
domaines n'était pas ancrée en fin d'hôte (`https://snu.gouv.fr.evil.tld`, `https://snu.gouv.fr@evil.tld`).
L'admin suivait ensuite la valeur avec `window.location.href`.

## Ce qui change

| Où | Avant | Après |
|---|---|---|
| `snu-lib` `isValidRedirectUrl` | regex sur le préfixe de la chaîne | analyse par `URL` (même parseur que le navigateur) : chemin relatif qui reste sur le site, ou URL `https` sans identifiants ni port dont l'hôte est `snu.gouv.fr`, `beta-snu.dev` ou l'un de leurs sous-domaines ; caractères de contrôle, espaces et `\` refusés d'emblée ; valeur absente ou non textuelle refusée |
| `snu-lib` `isInternalRedirectUrl` (nouveau) | — | vrai pour un chemin relatif qui reste sur le site |
| admin `signin`, `signin2FA` | `window.location.href = redirect` ; `FORCE_REDIRECT` (connexion) et `environment === "development"` (2FA) acceptaient n'importe quelle valeur | `redirectAfterSignin` : chemin relatif → `history.push` ; URL SNU `https` → navigation ; en développement seulement (`FORCE_REDIRECT`), `http://localhost:…` en plus (base de connaissance locale) ; sinon retour à l'accueil |
| admin `signin`, `signin2FA` (déjà connecté) | `<Redirect to={redirect}>` sans contrôle | seulement si le chemin est interne |
| app `signin`, `signin2FA` | `history.push(redirect)` même pour une URL absolue (lien depuis la base de connaissance cassé) ; `isValidRedirectUrl(undefined)` renvoyait vrai | même `redirectAfterSignin` que l'admin, sans exception de développement |

Le message d'erreur n'affiche plus la valeur reçue (texte contrôlé par l'auteur du lien).

## Démonstration

`packages/lib/src/utils/request.spec.ts` (41 cas) : sur l'ancienne implémentation, 22 cas d'attaque
sont acceptés (`javascript:`, `java<TAB>script:`, `data:`, `/\evil.tld`, `https:evil.tld`,
`https://snu.gouv.fr@evil.tld`, `https://snu.gouv.fr.evil.tld`, port explicite…).

## Vérification (Node 20)

| Contrôle | Résultat |
|---|---|
| `packages/lib` — `jest src/utils` | 3 suites, 73/73 |
| `packages/lib` — `tsc --noEmit`, eslint des fichiers modifiés | 0 erreur |
| `admin`, `app` — `tsc -p tsconfig.ci.json --noEmit` | 0 erreur |
| `admin`, `app` — eslint `src/scenes/auth` | 0 erreur (2 avertissements préexistants dans app) |

## Points d'attention

- `FORCE_REDIRECT` est désactivé en production, staging, custom et CI (`packages/lib/src/features.ts`) ;
  il ne reste actif qu'en développement et en test, et n'y élargit plus qu'à `http://localhost`.
- La base de connaissance en staging renvoie vers `http://localhost:8084` (`knowledge-base-public/src/config.js`) :
  cette redirection est désormais refusée en staging, ce qui ne change rien en pratique (elle ne menait nulle part).
- Défense en profondeur : CSP de l'admin interdisant les navigations `javascript:` — GOO-17.
