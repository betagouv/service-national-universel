# Lot I — séjour, point de rassemblement et éligibilité d'un autre volontaire (M59, M56, L8)

Audit du 2026-09-21. Vérifié, démontré et corrigé le 2026-09-23 sur `origin/main` @ `044eb9382`
(branche `fix/securite-api-lot-i-session-point-rassemblement`).

## 1. Vérification

La vérification préalable concluait que les trois entrées étaient ouvertes, puisque
`young/session.js` et `young/meeting-point.js` n'ont pas bougé depuis l'audit. Ce raisonnement ne
suffit pas : le contrôle d'appartenance a été ajouté **au montage** des sous-routeurs, dans
`controllers/young/index.ts`, par la PR #5313 (`youngPerimeterMiddleware`, lot 3).

| Id | Constat de l'audit | État réel sur `origin/main` |
| --- | --- | --- |
| M59 | `GET /young/:id/session` : session phase 1 d'un autre jeune | **IDOR déjà fermé** par #5313 : le sous-routeur est monté derrière `youngPerimeterMiddleware()` (un jeune ne passe que sur son propre `:id`, un référent via `canEditYoungInScope`). **Restait ouvert** : `serializeSessionPhase1(session)` était appelé sans `req.user`, donc `isYoung(undefined)` était faux et la `waitingList` du séjour (identifiants d'autres volontaires) était renvoyée au jeune affecté. |
| M56 | `GET /young/:id/meeting-point` : point de rassemblement d'un autre jeune | **Déjà fermé** par #5313, même montage. Le document renvoyé est un point de rassemblement (adresse, horaires, bus), sans donnée personnelle. |
| L8 | `POST /cohort-session/eligibility/2023/:id` : oracle sur un volontaire quelconque | **Ouvert.** `YoungModel.findById(id)` sans aucun contrôle : tout jeune ou tout référent apprenait l'existence d'un identifiant et les séjours auxquels ce volontaire est éligible (donc indirectement son département et sa tranche d'âge). |

## 2. Démonstration

Suite `api/src/__tests__/young-session-eligibility-security.test.ts`, jouée avant correctif :

| Cas | Avant | Après |
| --- | --- | --- |
| M59 — un jeune lit la session d'un autre jeune | 403 (déjà fermé) | 403 |
| M59 — la `waitingList` est absente de la réponse au jeune affecté | **rouge** (liste renvoyée) | vert |
| M56 — un jeune lit le point de rassemblement d'un autre jeune | 403 (déjà fermé) | 403 |
| M56 — un référent départemental hors du département du jeune | 403 (déjà fermé) | 403 |
| L8 — un jeune calcule l'éligibilité d'un autre jeune | **rouge** (200) | 403 |
| L8 — un jeune sonde un identifiant inexistant | **rouge** (404, donc oracle) | 403 |
| L8 — un référent départemental hors du département du volontaire | **rouge** (200) | 403 |
| L8 — un administrateur CLE sans lien avec la classe du volontaire | **rouge** (200) | 403 |
| L8 — un jeune sur son propre `:id`, un référent du bon département, un appel sans `:id` | vert | vert |

## 3. Correctifs

### M59 — `controllers/young/session.js`

`serializeSessionPhase1(session, req.user)` : le sérialiseur retire déjà `waitingList` lorsque
l'appelant est un jeune ; il ne recevait simplement pas l'appelant.

### L8 — `controllers/cohort-session.ts`

Quand `:id` est fourni :

- un jeune n'est accepté que sur son propre identifiant, **avant** la lecture en base, pour que le
  403 ne distingue pas un identifiant existant d'un identifiant inexistant ;
- un référent doit pouvoir ouvrir le dossier du volontaire : `canViewYoungFileInScope`, le périmètre
  de `GET /referent/young/:id`. C'est de cette fiche que part le seul appel avec `:id`
  (`ChangeCohortPen`, admin), qui s'exécute pour tout rôle ouvrant la fiche : un périmètre plus
  étroit ferait échouer l'appel pour des utilisateurs légitimes (responsables de structure).

L'appel sans `:id` (données saisies dans le formulaire d'inscription ou de changement d'adresse)
n'est pas concerné : il ne lit aucun volontaire.

Deux tests existants de `cohort-session.test.ts` appelaient la route avec un administrateur CLE et un
référent départemental sans rattachement au volontaire ; ils le sont désormais.

## 4. Limites

Pour un référent, un identifiant inexistant répond toujours 404 et un volontaire hors périmètre 403.
L'écart ne révèle que l'existence d'un `ObjectId`, sans aucune donnée du volontaire.
