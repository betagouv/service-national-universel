# Lot P27 — api + apiv2 : intégrité et traçabilité de l'impersonation

Audit de sécurité de la production du 25/09/2026, constats PH14 (élevée) et PL7 (faible), scission
de P07 (ticket Linear GOO-71). Vérifié ouvert puis corrigé le 2026-09-26 sur `origin/main`, après
P24 (GOO-56, mergée) dont ce lot réutilise `passport.validateUser` et le middleware apiv2.

## 1. Constats et correctifs

| Constat | Route / fichier | Avant | Après |
| --- | --- | --- | --- |
| PH14 | `GET /referent/restore_signin` (`api/src/referent/referentController.ts`) | Recréait une session ADMIN neuve à partir de tout jeton d'impersonation encore signé et non expiré, sans revérifier l'état de l'usurpateur : un jeton capturé (XSS, log, poste partagé) restait exploitable après un logout ou un changement de mot de passe de l'admin, et chaque appel régénérait un nouveau plafond de 12h au lieu de respecter celui de la session d'origine | Le jeton d'impersonation embarque désormais l'état de session de l'usurpateur (`_impersonatorLastLogoutAt`, `_impersonatorPasswordChangedAt`, `sessionStartedAt`) au moment de `signin_as` ; `restore_signin` revérifie ces trois marqueurs contre l'état actuel de l'admin en base avant de recréer la session, et propage `sessionStartedAt` au lieu de le réinitialiser |
| PH14 | `POST /referent/signin_as/:type/:id` | Un admin pouvait prendre sa propre place, ou emprunter une seconde identité depuis une session déjà empruntée (impersonation en cascade) | Les deux cas renvoient 403 (`OPERATION_UNAUTHORIZED`). Le refus est codé dans le contrôleur, pas dans `canSigninAs` (`packages/lib/src/roles.ts`), dont la branche CLE disparaît en P25 |
| PL7 | `passport.validateUser` (`api/src/passport.ts`) | L'usurpateur était cherché dans `userModel` (le modèle de la **cible**) : pour une impersonation de jeune, cela interrogeait `YoungModel` avec l'id d'un admin — `impersonatedBy` restait indéfiniment vide, sans trace de l'auteur réel | Recherche toujours dans `ReferentModel`, quel que soit le modèle de la cible |
| PL7 | apiv2 (`AddUserToRequest.middleware.ts`, `JwtToken.service.ts`, `Auth.provider.ts`) | `_impersonateId` du jeton v1 n'était jamais lu côté apiv2 : une action faite sous impersonation référent sur une route `/v2` restait attribuée au compte emprunté, sans aucune trace de l'admin usurpateur | `_impersonateId` est remonté par `JwtTokenService.parseToken` (champ `impersonateId`) et propagé sur `req.user.impersonateId` ainsi que dans le contexte CLS |
| PL7 | `POST /referent/signin_as/:type/:id` | Pas de journalisation : aucune recherche d'abus fiable n'était possible après coup | `logger.info` sur chaque `signin_as` réussi, avec les identifiants de l'usurpateur et de la cible (aucun email ni autre PII) |

## 2. Choix

- **Marqueurs de l'usurpateur plutôt qu'une table de sessions dédiée** : réutilise le mécanisme déjà
  en place pour la cible (`passwordChangedAt`/`lastLogoutAt` comparés en base, GOO-16) plutôt que
  d'introduire un état de révocation séparé — cohérent avec le reste de l'authentification v1, sans
  nouvelle dépendance.
- **`sessionStartedAt` propagé, pas réinitialisé** : reprend exactement le motif de `refreshToken`
  (`auth.ts`, GOO-16) — un jeton d'impersonation capturé ne doit pas pouvoir repousser indéfiniment
  le plafond absolu de 12h en rappelant `restore_signin` en boucle.
- **Refus auto-impersonation/cumul dans le contrôleur, pas dans `canSigninAs`** : `roles.ts` perd sa
  branche CLE en P25 (décommissionnement) ; un refus indépendant du rôle ne doit pas dépendre de ce
  fichier appelé à changer.
- **Journalisation minimale (ids seulement)** : suffisant pour une recherche d'abus a posteriori,
  sans risquer de PII dans les journaux (cf. `@snu/log-redaction`, déjà en place sur `logger`).

## 3. Fichiers touchés

`api/src/referent/referentController.ts`, `api/src/passport.ts`,
`apiv2/src/admin/infra/iam/auth/Auth.provider.ts`,
`apiv2/src/admin/infra/iam/auth/JwtToken.service.ts`,
`apiv2/src/admin/infra/iam/auth/AddUserToRequest.middleware.ts`,
`apiv2/src/shared/infra/CustomRequest.ts`.

## 4. Reste ouvert

- Aucun. Le déploiement api/apiv2 peut se faire sans ordre particulier : apiv2 se contente de lire
  un champ (`_impersonateId`) déjà présent dans les JWT émis par l'api v1, avant comme après ce lot.

## 5. Tests

- `api/src/__tests__/impersonation-integrity-goo-71.test.ts` (nouveau) : refus de l'auto-
  impersonation et du cumul de sessions empruntées (`signin_as`) ; `restore_signin` — restauration
  normale, propagation de `sessionStartedAt`, refus après changement de mot de passe de
  l'usurpateur, refus après déconnexion de l'usurpateur ailleurs, refus au-delà du plafond de 12h,
  refus d'un jeton sans `_impersonateId` ; journalisation de `signin_as` sans PII.
- `api/src/__tests__/passport.test.ts` : nouveau describe PL7 — `impersonatedBy` correctement
  renseigné quand la cible impersonée est un jeune (`YoungModel`) ou un référent (`ReferentModel`),
  la recherche de l'usurpateur passant toujours par `ReferentModel.findById`.
- `apiv2/src/admin/infra/iam/auth/JwtToken.service.spec.ts` (nouveau) : `_impersonateId` du jeton
  remonté sous le nom `impersonateId`, absent hors impersonation.
- `apiv2/src/admin/infra/iam/auth/AddUserToRequest.middleware.spec.ts` : nouveau describe PL7 —
  `impersonateId` propagé sur `req.user` et dans le contexte CLS.
- Régression : `invitation-impersonation-security`, `sessions-goo-16`, `referent` (api),
  `AddUserToRequest.middleware.spec` (apiv2, suites existantes) — tous verts. `tsc --noEmit` propre
  sur `api` (hors une erreur préexistante et sans rapport, `inscription-goal.test.ts`/`cohort.ts`,
  non touchée par ce lot) et sur `apiv2`.

## 6. Tâches post-déploiement

- Si des journaux applicatifs existent en production, chercher rétroactivement des appels
  `restore_signin` intervenus après un changement de mot de passe admin ou une déconnexion globale
  — signe possible d'un jeton d'impersonation déjà capturé avant ce correctif.
- Surveiller le nouveau log `referent.signin_as: <admin> -> <type>:<cible>` : un volume ou des
  identifiants inattendus signalent un abus à instruire.
