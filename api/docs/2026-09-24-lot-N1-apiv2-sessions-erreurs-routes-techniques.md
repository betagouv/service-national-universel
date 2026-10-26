# Lot N1 — apiv2 : sessions, erreurs et routes techniques (M76, L41, L42, L44, L45)

Date : 2026-09-24 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-31 · Branche `fix/goo-31-lot-n1-apiv2`, base `origin/main` (`d4f5562f8`)

## État des constats sur `origin/main`

| Id | Déjà corrigé | Restait ouvert |
|---|---|---|
| M76 | `AddUserToRequestMiddleware` compare `__v`, `lastLogoutAt`, `passwordChangedAt` au compte et rejette `deletedAt` / `INACTIVE` (#5352, H74) | un jeton signé dont l'`id` n'était pas un ObjectId ou ne désignait aucun référent répondait 500 (CastError) ou 422 (NOT_FOUND du dépôt) au lieu de 401 |
| L42 | `AllExceptionsFilter` n'envoie plus ni en-têtes ni corps à Sentry, `beforeSend: redactSentryEvent` (#5352 / #5330) | aucun paramètre de route `:id` validé : `/v2/phase1/simulations/abc` → CastError → 500 + événement Sentry, à la demande |
| L45 | — | `GET /v2/testsentry` exclu de l'authentification, lève une 500 à chaque appel |
| L44 | — | `POST /v2/task` (« for testing purposes only ») crée une tâche arbitraire, métadonnées comprises |
| L41 | — | `ClassePublic.controller.ts` jamais enregistré (route déjà en 404) mais son exclusion d'authentification et le cas d'usage `FindClassePourPublic` restaient |

## Ce qui change

| Id | Avant | Après |
|---|---|---|
| M76 | `findById(payload.id)` sans filet | `id` non ObjectId → 401 sans requête ; NOT_FOUND du dépôt → 401 ; les autres erreurs (base indisponible) restent propagées |
| L42 | aucun contrôle | pipe global `ObjectIdParamsPipe` : tout paramètre de route nommé `id` ou `…Id` (`sessionId`, `taskId`, `centreId`…) doit être un ObjectId hexadécimal de 24 caractères, sinon 400. Les `@Param()` objets (DTO avec `@IsMongoId`) ne sont pas concernés. Branché dans `main.ts` et dans les applications de test via `pipesGlobaux()` |
| L45 | route présente et publique | route et exclusion supprimées (le `SENTRY_PROVIDER` n'est plus injecté dans `HealthCheckController`) |
| L44 | `POST /v2/task` | supprimée : aucun appelant (front, tests, scripts) ; `GET /v2/task` et `GET /v2/task/:id` (super-admin) conservées |
| L41 | fichier mort + exclusion | fichier, cas d'usage et exclusion supprimés ; l'app appelle `/cle/classe/public/:id` sur l'API v1, pas apiv2 |

Choix : un pipe global plutôt qu'un `ParseObjectIdPipe` par contrôleur — les 46 paramètres
identifiants recensés sont tous des ObjectId, et un nouveau contrôleur est couvert d'office.

## Démonstration

- `src/shared/infra/ObjectIdParams.pipe.spec.ts` — `abc` et une chaîne de 12 caractères (acceptée
  par `isValidObjectId` de mongoose) → 400 ; ObjectId valide, paramètres non identifiants, query et
  body laissés intacts.
- `test/admin/sejour/phase1/Phase1.controller.spec.ts` — `GET /phase1/simulations/abc`,
  `GET /phase1/abc/simulations`, `DELETE /phase1/abc/plan-de-transport` → 400 (500 sans le pipe :
  contre-épreuve faite).
- `src/admin/infra/iam/auth/AddUserToRequest.middleware.spec.ts` — NOT_FOUND → 401, id non ObjectId
  → 401 sans appel au dépôt, erreur technique propagée.
- `test/health/HealthCheck.controller.spec.ts` — `GET /testsentry` → 404.

Suite apiv2 complète : 107 suites, 714 tests verts (transpilation seule en local ; le type-check
jest échoue en worktree sur les types mongoose de `snu-lib`, sans rapport avec ce lot).

## Hors périmètre / à surveiller

- `GET /v2/` renvoie toujours la `release` : conservé, sert de sonde de version.
- `apiv2` et l'API v1 dupliquent la validation de session (`api/src/passport.ts`) ; la mutualiser
  dans snu-lib reste souhaitable, mais la v1 lit aussi les jeunes (`anonymized`, `DELETED`), pas apiv2.
