# GOO-9 — redirection après connexion : `isValidRedirectUrl` (FH18)

Date : 2026-09-23 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`d0a9ab330`)

Le constat a été relu sur le code courant avant correction : confirmé. Toute valeur qui ne commençait
ni par `http(s)://` ni par `//` était acceptée (`javascript:…`, `data:…`, `/\hôte`), et la regex des
domaines n'était pas ancrée en fin d'hôte (`https://snu.gouv.fr.evil.tld`, `https://snu.gouv.fr@evil.tld`).
L'admin suivait ensuite la valeur avec `window.location.href`.

## Ce qui change

| Où | Avant | Après |
|---|---|---|
| `snu-lib` `isValidRedirectUrl` | regex sur le préfixe de la chaîne | analyse par `URL` (même parseur que le navigateur) : chemin relatif qui reste sur le site, ou URL sans identifiants dont l'origine figure dans une liste fermée (fronts SNU et base de connaissance, production et staging) ; caractères de contrôle, espaces et `\` refusés d'emblée ; valeur absente ou non textuelle refusée |
| `snu-lib` `isInternalRedirectUrl`, `getSafeExternalRedirectUrl` (nouveaux) | — | chemin relatif qui reste sur le site ; URL externe **reconstruite** depuis l'origine autorisée (constante) et le chemin, jamais recopiée |
| admin `signin`, `signin2FA` | `window.location.href = redirect` ; `FORCE_REDIRECT` (connexion) et `environment === "development"` (2FA) acceptaient n'importe quelle valeur | `redirectAfterSignin` : chemin relatif → `history.push` ; URL d'un front SNU → navigation vers l'URL reconstruite ; sinon retour à l'accueil. `FORCE_REDIRECT` et l'exception de développement ne sont plus consultés |
| admin `signin`, `signin2FA` (déjà connecté) | `<Redirect to={redirect}>` sans contrôle | seulement si le chemin est interne |
| app `signin`, `signin2FA` | `history.push(redirect)` même pour une URL absolue (lien depuis la base de connaissance cassé) ; `isValidRedirectUrl(undefined)` renvoyait vrai | même `redirectAfterSignin` que l'admin |

Le message d'erreur n'affiche plus la valeur reçue (texte contrôlé par l'auteur du lien).

## Démonstration

`packages/lib/src/utils/request.spec.ts` : sur l'ancienne implémentation, 22 cas d'attaque
sont acceptés (`javascript:`, `java<TAB>script:`, `data:`, `/\evil.tld`, `https:evil.tld`,
`https://snu.gouv.fr@evil.tld`, `https://snu.gouv.fr.evil.tld`, port explicite…).

## Vérification (Node 20)

| Contrôle | Résultat |
|---|---|
| `packages/lib` — `jest src/utils` | 3 suites, 81/81 |
| `packages/lib` — `tsc --noEmit`, eslint des fichiers modifiés | 0 erreur |
| `admin`, `app` — `tsc -p tsconfig.ci.json --noEmit` | 0 erreur |
| `admin`, `app` — eslint `src/scenes/auth` | 0 erreur (avertissements préexistants dans app) |

## Points d'attention

- La liste d'origines est fermée : un nouveau front vers lequel rediriger après connexion doit y être ajouté
  (`ALLOWED_REDIRECT_ORIGINS`, `packages/lib/src/utils/request.ts`). Les recettes `env-*` n'y figurent pas.
- `FORCE_REDIRECT` était déjà désactivé en production, staging, custom et CI (`packages/lib/src/features.ts`) ;
  la connexion ne le consulte plus. En développement local, un lien vers la base de connaissance
  (`http://localhost:8084`) ramène donc à l'accueil après connexion.
- CodeQL (« Client-side URL redirect / XSS ») ne reconnaît pas un validateur maison : c'est pourquoi l'URL
  suivie est reconstruite à partir d'une constante plutôt que recopiée.
- Défense en profondeur : CSP de l'admin interdisant les navigations `javascript:` — GOO-17.
