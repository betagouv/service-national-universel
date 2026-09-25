# Lot K2 — centres de cohésion : écriture, export des présences et lecture (M10, M11, L6)

Audit du 2026-09-21. Vérifié et corrigé le 2026-09-23 sur `origin/main` @ `68e7252c4`
(ticket Linear GOO-27). Les trois constats étaient encore ouverts.

## 1. Constat

| Id | Route | Défaut | Correctif |
| --- | --- | --- | --- |
| M10 | `POST /cohesion-center`, `PUT /cohesion-center/:id` | tout référent départemental / régional **et le transporteur** (`canCreateOrUpdateCohesionCenter`) créait ou modifiait n'importe quel centre ; `PUT /:id` propageait adresse, département et région aux jeunes, sessions et plans de transport (`updateCenterDependencies`) et spreadait le document mongoose (`{ ...center, ...value }`) | routes **supprimées** : marquées `@deprecated` (centres importés du SI-SNU), aucun front ne les appelait |
| M10 | `PUT /cohesion-center/:id/session-phase1` | création d'une session dans n'importe quel centre, transporteur compris | administrateur ou référent du département / de la région du centre |
| M11 | `POST /cohesion-center/export-presence` | statistiques de présence nationales pour tout compte référent (responsable compris), `SessionPhase1Model.find()` sans filtre + une requête jeunes par session | route **supprimée** : aucun appelant (ni admin, ni apiv2) |
| L6 | `GET /cohesion-center`, `/:id`, `/:id/session-phase1`, `/:id/cohort/:cohort/session-phase1` | garde par rôle seul (`canViewCohesionCenter`) : transporteur, rôles CLE et centre, et référents de tout territoire lisaient tous les centres et leurs sessions (équipe, liste d'attente, contact sanitaire) | périmètre géographique du centre ; liste filtrée en base |

## 2. Correctifs

- Les routes restantes utilisent le périmètre des séjours (`services/sejourAccess.ts`, lot K1) :
  administrateur, ou référent départemental / régional dont le territoire contient le département /
  la région **du centre**. Tout autre rôle est refusé (fail-closed) : transporteur, rôles CLE, chefs
  de centre, adjoints, référents sanitaires (ces trois derniers inactifs depuis ~sept. 2025).
- Nouveaux helpers : `getCohesionCenterScopeFilter` (liste) et `isCohesionCenterDocInUserScope`
  (centre déjà chargé). `getSessionPhase1ScopeFilter` partage désormais la même implémentation.
- `GET /cohesion-center` filtre en base au lieu de `find({})`. L'admin (`invite.jsx`) appliquait
  déjà ce filtre côté navigateur : le comportement affiché ne change pas.
- `GET /:id` et `/:id/cohort/:cohort/session-phase1` valident l'identifiant (`validateId`) : un
  identifiant mal formé renvoyait 500 (CastError).
- Les sérialiseurs reçoivent enfin `req.user` : `GET /cohesion-center/young/:youngId` retire la liste
  d'attente du centre renvoyé au jeune, ce qu'il était censé faire.
- Code mort retiré : `updateCenterDependencies` (`utils`), `canCreateOrUpdateCohesionCenter`
  (`snu-lib`).
- `team`, `waitingList`, `sanitaryContactEmail` restent visibles de l'administrateur et des
  référents du territoire, comme sur `/session-phase1` depuis K1 : aucun autre rôle n'atteint plus
  ces routes.

## 3. Tests

`api/src/__tests__/cohesion-center-perimetre.test.ts` (8 cas) : `PUT /:id`, `POST /`,
`POST /export-presence` → 404 ; `PUT /:id/session-phase1` refusé hors périmètre, au transporteur,
aux rôles CLE et au responsable, ouvert au référent du territoire ; lecture d'un centre et de ses
sessions refusée hors périmètre ; liste limitée au territoire ; identifiant invalide → 400.
7 des 8 cas échouent sur le contrôleur de `origin/main`. Les tests de `cohesion-center.test.ts`
qui appelaient les routes supprimées sont retirés.

## 4. Restes

- `GET /session-phase1/:id/cohesion-center` reste gardé par rôle (`canViewCohesionCenter`) : l'écran
  jeune de l'admin l'appelle pour des jeunes affectés hors de leur département, et le centre
  renvoyé ne contient pas de PII.
- `DELETE /cohesion-center/:id` (administrateur seul, `@deprecated`) est conservée.
- Les centres sans `department` / `region` ne sont plus visibles que des administrateurs.
