# Lot R1 — support : jetons agents et mots de passe (M98, L47, L48, L49, L52)

Date : 2026-09-24 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-32 · Branche `fix/goo-32-lot-r1-support-jetons-agents`, base `origin/main` (`25a2b03ea`)

## Contexte

Dans snupport-api, une session agent (cookie `jwtzamoud`) valait 24 h et ne pouvait pas être révoquée.
Ni la déconnexion ni un changement de mot de passe n'invalidaient un jeton déjà émis : une copie volée
(par exemple par une XSS dans snupport-app, voir GOO-6) restait une session valide jusqu'à son
expiration. Le secret de signature retombait sur « my-secret » s'il manquait, le listing des agents
exposait les champs de réinitialisation du mot de passe, et la politique de mot de passe se limitait à
6 caractères, sans exigence de complexité.

## État des constats sur `origin/main`

Chaque constat a été relu sur le code courant avant correction.

| Id | Déjà corrigé | Restait ouvert |
|---|---|---|
| L48 | jeton retiré du corps de `GET /agent/me` et de `POST /agent/signin` (#5361, GOO-6) | — |
| M98 | — | durée de 24 h, aucune invalidation |
| L47, L49, L52 | — | ouverts |

## Ce qui change

| Id | Où | Avant | Après |
|---|---|---|---|
| M98 | `jwt-options.js`, `cookie-options.js` | jeton et cookie de 24 h | **2 h**, soit la durée du cookie posé par l'API v1 au SSO |
| M98 | `models/agent.js`, `utils/agentToken.js`, `passport.js` | charge utile `{ __v, _id }` | le jeton porte `lastLogoutAt` et `passwordChangedAt`, que la stratégie `agent` compare à la base, comme l'API v1 (`api/src/passport.ts`). `JWT_VERSION` passe à `"1"` |
| M98 | `POST /agent/logout` | effaçait seulement le cookie | fait avancer `lastLogoutAt`, ce qui révoque tous les jetons émis pour l'agent |
| M98 | `POST /agent/forgot_password_reset` | changeait le mot de passe | fait aussi avancer `passwordChangedAt`, ce qui révoque les sessions ouvertes avec l'ancien mot de passe |
| M98 | `GET /v0/sso/signin` | signature en dur | même helper `signAgentToken` |
| L47 | `config.ts` | `JWT_SECRET` retombait sur « my-secret » dans tous les environnements | repli limité à `development`/`test` ; ailleurs, le démarrage échoue sans `JWT_SECRET` (même garde que `PASSWORD_RESET_TOKEN_SECRET`) |
| L49 | `models/agent.js` | `forgotPasswordResetToken` et `forgotPasswordResetExpires` renvoyés partout | `select: false` |
| L49 | `GET /agent`, `GET /contact/:id` (repli sur un agent) | document complet (empreinte de reset, `snuReferentId`…) | projection `_id firstName lastName email role departments region` (`utils/agentSerializer.js`) |
| L49 | `POST /agent/signin`, `GET /agent/me` | document complet de l'agent connecté | `serializeAgentSelf` : champs publics, plus `organisationId`, `department`, `isReferent`, `lastLoginAt`, `createdAt` |
| L52 | `utils/password.js` | 6 caractères minimum | 12 caractères avec majuscule, minuscule, chiffre et symbole (règle de `validatePassword` de l'API v1) ; la page de réinitialisation de snupport-app affiche la règle |

### Corrections liées

- **Durée de validité du lien de réinitialisation.** Elle était calculée en ajoutant `JWT_MAX_AGE`, exprimé
  en secondes, à `Date.now()`, exprimé en millisecondes : le lien expirait au bout de **86 secondes**. La
  réduction de `JWT_MAX_AGE` l'aurait ramenée à 7 secondes. La durée a désormais sa propre constante :
  1 h.
- **Création d'un agent (`POST /agent`).** Le mot de passe aléatoire (32 caractères hexadécimaux), que
  personne ne connaît, n'est plus soumis à `validatePassword` : il échouerait à la nouvelle règle de
  complexité et bloquerait la création. L'agent choisit son mot de passe via « mot de passe oublié ».

Le rôle et le périmètre d'un agent sont relus en base à chaque requête : un retrait ou un changement
de rôle s'applique donc immédiatement, sans avoir à invalider le jeton.

## Démonstration

`snupport-api/src/__tests__/agentSession.lotr1.test.js` ajoute 23 tests :

- avec la vraie stratégie passport : un jeton émis avant un changement de mot de passe, avant une
  déconnexion, ou à l'ancien format de 24 h, reçoit une **401** ; un jeton à jour passe ;
- `POST /agent/logout` et `POST /agent/forgot_password_reset` font avancer les dates, ce qui révoque le
  jeton courant ; le lien de réinitialisation vaut 1 h ;
- mots de passe faibles refusés (`PASSWORD_NOT_VALIDATED`), création d'agent inchangée ;
- `GET /agent`, `GET /agent/me` et `GET /contact/:id` ne renvoient ni les champs de réinitialisation, ni
  `snuReferentId`, ni les dates de session ;
- démarrage en `production` sans `JWT_SECRET` : exception, sans repli sur « my-secret ».

La fixture de `knowledgeBaseReader.routes.test.js` signait un jeton à l'ancien format : elle signe
désormais le format courant.

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `npx jest --maxWorkers=1` (snupport-api) | 41 suites, 389 tests, tous verts |
| `npx tsc -p tsconfig.check.json --noEmit` | OK |
| `eslint` sur les fichiers modifiés hors tests | 0 erreur |

## Déploiement et actions en production

- **Toutes les sessions agents sont coupées au déploiement.** `JWT_VERSION` passe à `"1"`, donc les jetons
  de 24 h déjà émis sont refusés. Les agents se reconnectent une fois ; les référents repassent par le
  SSO de l'admin SNU.
- **Vérifier `JWT_SECRET` sur l'application Clever Cloud du support** (`PROD-SNU-SUPPORT` et les
  recettes) avant de déployer : sans la variable, l'application ne démarre plus. Vérifier aussi que la
  valeur n'est pas « my-secret » ni un secret partagé avec l'API v1. Sinon, la faire tourner.
- La nouvelle règle de mot de passe ne s'applique qu'au prochain changement. Les mots de passe
  existants de moins de 12 caractères restent valides jusque-là. Aucune réinitialisation forcée n'est
  faite ici.

## Hors périmètre

- Limitation du débit sur `POST /agent/signin` et `POST /agent/forgot_password` (toujours absente dans
  snupport-api).
- `POST /agent/forgot_password` répond 404 pour un email inconnu (oracle d'existence des comptes agents),
  hors des constats de ce lot.
