# GOO-16 — sessions : JWT admin hors localStorage, CSRF et CORS (FM16, FM2, FM17, FM19, FM21, FL11)

Date : 2026-09-24 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`d4f5562f8`)

Chaque constat a été relu sur le code courant avant correction.

## Ce qui change

| Constat | Où | Avant | Après |
|---|---|---|---|
| FM16 | `api` routes de session (`signin`, `signin-2fa`, `signin_token`, `refresh_token`, `signin_as`, `restore_signin`, `signup_invite`, inscription et validation d'email du volontaire) | le JWT était renvoyé dans le corps de la réponse ; l'admin le gardait en `localStorage` et l'envoyait en `Authorization` | le JWT ne vit plus que dans le cookie httpOnly (`jwt_ref`, `jwt_young`) ; aucune réponse ne le contient |
| FM16 | `admin` `services/api.ts`, `services/apiv2.ts` | `localStorage.jwt_token` + en-tête `Authorization: JWT …` | plus de stockage ni d'en-tête : `credentials: "include"` (api) et `withCredentials` (apiv2). La clé `jwt_token` laissée par une version précédente est effacée au chargement |
| FM16 | `apiv2` `AddUserToRequestMiddleware`, CORS | seul l'en-tête `Authorization` était lu ; CORS sans credentials | à défaut d'en-tête, lecture du cookie `jwt_ref`, **seulement si `Origin` est l'admin** (même règle que `api/src/passport.ts`) ; CORS `credentials: true` sur les origines déjà listées |
| GOO-16 | `api` `GET /referent/refresh_token` | un jeton se renouvelait indéfiniment toutes les 2 h | durée absolue de 12 h (`JWT_SESSION_ABSOLUTE_MAX_AGE_MS`) : l'instant de connexion (`sessionStartedAt`) suit le jeton ; un jeton antérieur est daté par son `iat`. Au-delà : 401 et cookie effacé |
| FM2 | `api` `POST /young/signin`, `/young/signin-2fa`, `/referent/signin`, `/referent/signin-2fa` | corps urlencoded accepté : un formulaire d'un autre site connectait la victime au compte de l'attaquant | middleware `requireJsonBody` : 415 pour tout corps non JSON (urlencoded, multipart, text/plain) |
| FM17 | `api` `POST /referent/signup_verify` | renvoyait le référent sérialisé, email compris — le second élément exigé par `signup_invite` | ne renvoie que `firstName`, `lastName`, `role`, `department` ; l'invité saisit son email. 404 pour un compte désactivé ou supprimé |
| FM17 | `api` `POST /referent/signup_invite` | activait un compte désactivé (`INACTIVE`) ou supprimé dont le jeton restait valide | 404 pour ces comptes |
| FM17 | `api` modèle `Referent` (pre-save) | la désactivation laissait le jeton d'invitation en place | passer un compte existant à `INACTIVE` vide `invitationToken` et `invitationExpires` |
| FM17 | `api` `POST /referent/:id/renew-invitation` | prolongeait le **même** jeton d'un mois | émet un nouveau jeton (valable un mois) et l'envoie par email ; l'ancien lien cesse de fonctionner. Refus (400) pour un compte déjà activé, désactivé, supprimé, ou CLE (dont le parcours d'activation est `/creer-mon-compte`) |
| FM19 | `snupport-api` CORS et `passport.getToken` | origines `SNU_URL_APP` et `SNU_URL_ADMIN` autorisées avec credentials ; cookie `jwtzamoud` lu pour toute origine sauf la KB | CORS limité à l'interface agent et à la KB ; cookie lu seulement sans `Origin` ou depuis `SNUPPORT_URL_ADMIN`. L'admin et moncompte n'appellent jamais snupport-api directement (tout passe par l'api v1 et sa clé d'API) |
| FL11 | `snupport-api` `index.ts` | `bodyParser.urlencoded` global | retiré : aucun client n'en envoie |
| FM21 | `snupport-app` | aperçus de tickets (messages compris) persistés par redux-persist et jamais purgés ; cache des articles KB (`snu-support-kb`) et brouillons (`snu-kb-content-*`) laissés en `localStorage` | à la déconnexion et sur toute réponse 401 : état des aperçus remis à zéro, `persistor.purge()`, clés KB effacées. Les fils de messages et la signature ne sont plus persistés (transform redux-persist) |

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `api` — `sessions-goo-16` (nouveau) | 21/21 |
| `api` — `invitation-impersonation-security`, `referent-auth`, `young-auth`, `auth-2fa-trust-token` | 5 suites avec la précédente, vertes |
| `api` — `referent`, `referent-inactive-session`, `knowledge-base-session`, `referent-security`, `auth-anti-abus`, `snupport`, `crons` | 219/219 |
| `api` — `tsc -p tsconfig.json --noEmit` | 0 erreur |
| `apiv2` — `src/admin/infra/iam` (dont `AddUserToRequest.middleware.spec`, 7 nouveaux cas) | 22/22 ; `tsc --noEmit` 0 erreur |
| `admin` — `tsc -p tsconfig.ci.json --noEmit` | 0 erreur |
| `snupport-api` — suite complète | 40 suites, 371/371 |
| `snupport-app` — `npm test` (dont `localSessionKeys.test.js`) | 15/15 |

## Déploiement

- **Ordre : apiv2, puis api et admin ensemble.**
  - apiv2 d'abord : le nouvel admin n'envoie plus d'en-tête `Authorization` et prendrait des 401 sur `/v2` face à
    l'ancienne apiv2. L'ancien admin reste compatible avec la nouvelle apiv2 (l'en-tête reste prioritaire).
  - api et admin ensemble : l'ancien admin envoie en priorité le jeton gardé en `localStorage`, que la nouvelle api
    ne renouvelle plus ; il expire au bout de 2 h et l'admin se déconnecte en boucle jusqu'au déploiement du nouveau
    front (qui efface cette clé au chargement).
- Aucune variable d'environnement nouvelle.

## Restant sur GOO-16

- Étude d'un cookie de session sans attribut `Domain` partagé (`.snu.gouv.fr`).

## Points d'attention

- Une requête GET cross-origin en mode `no-cors` n'a pas d'en-tête `Origin` : snupport-api l'accepte avec le
  cookie agent, comme une navigation. La réponse reste illisible pour la page appelante ; seules des routes GET à
  effet de bord seraient exposées.
- Le plafond de 12 h déconnecte un agent resté connecté plus d'une journée de travail, même actif.
