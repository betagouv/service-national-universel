# Lot P23 — Décommissionnement des écritures phase 1 et des objectifs d'inscription

Audit de sécurité de la production du 25/09/2026, constats PH15, PM18, PM28, PM29, PM35, PL9 et PL23
(ticket Linear GOO-65). Vérifiés ouverts le 2026-09-27 sur `origin/main`, puis fermés par retrait.

Décisions du 25/09 : les écritures qui ne concernent que la phase 1 sont **retirées**, pas corrigées ; les
lectures phase 1 restent. La correction manuelle de `statusPhase1` est retirée entièrement, ADMIN et
super-admin compris : un dossier historique mal pointé se corrige par script.

## 1. Ce qui est retiré

### Changement de séjour

- `PUT /referent/young/:id/change-cohort`, avec la bascule CLE ↔ HTS et ses helpers.
- `GET` et `PUT /young/change-cohort`.
- `POST /cohort-session/eligibility/2023/:id?`, qui n'avait plus d'appelant ensuite. `GET /cohort-session/isInscriptionOpen`
  reste.
- Admin : crayon et modale « Changer de cohorte » de la fiche volontaire (`ChangeCohortPen`, `ChangeCohortModal`).
- App : écrans « Changer de séjour », « Prévenir du prochain séjour » et « Pas de date », et le lien « Changer
  mes dates de séjour ». Le désistement (`/changer-de-sejour/se-desister`) reste. Les autres URL
  `/changer-de-sejour/*` renvoient à l'accueil.

### Invitation d'un volontaire

- `POST /young/invite` : sans appelant depuis #5214, elle recopiait tel quel le corps validé par
  `validateYoung`, statuts de phase, session, centre, PDR, territoire et classe compris.

### Écritures phase 1 des routes mixtes

- `validateYoung` (schéma de `PUT /referent/young/:id`) ne connaît plus les clés de cohorte, d'affectation,
  de présence, de départ et de statut de phase 1, ni `classeId`. Il ne connaît plus non plus `email` (PH15), les
  consentements, le droit à l'image, les attestations et les drapeaux FranceConnect (PM35). Ces clés sont
  **ignorées** (`stripUnknown`), pas refusées : un client qui renvoie le dossier complet reçoit toujours 200.
  Aucun front n'envoyait ces champs sur cette route.
- `PUT /referent/young/:id` : plus de dérivation de `statusPhase1` depuis `cohesionStayPresence` (ni de l'email
  d'arrivée au centre), de remise à zéro de l'affectation (REINSCRIPTION, WITHDRAWN, passage en liste
  complémentaire via `switchYoungByIdToLC`), de contrôle AFFECTED ni de recalcul des places.
- `PUT /young-edition/:id/phasestatus` : `statusPhase1` est refusé en 400 (`Joi.forbidden`), et au moins un
  statut de phase 2 ou 3 est exigé. Plus de remise à zéro de l'affectation ni de recalcul des places. Admin :
  la ligne « Phase 1 » du menu « Statuts de phases » reste, en lecture seule (statut affiché, sans sous-menu).
- `getPhaseStatusOptions` (snu-lib) n'a plus d'entrée pour la phase 1 et renvoie une copie : l'ajout
  d'`AFFECTED` pour le super-admin mutait la matrice partagée (PL23).
- `PUT /young/withdraw` : le désistement ne remappe plus `statusPhase1` et ne vide plus l'affectation.
  Il ne recalcule plus non plus les places de session ni de bus.
- `PUT /young/account/address` : plus de garde AFFECTED, plus de recalcul du statut (`NOT_ELIGIBLE`,
  `WAITING_LIST`) selon l'éligibilité au séjour et les objectifs. L'adresse, le QPV, la densité et les
  notifications `DEPARTMENT_IN/OUT` restent. App : la modale de changement d'adresse n'envoie plus que
  l'adresse.
- Code mort supprimé : `updatePlacesSessionPhase1`, `updatePlacesCenter`, `placesTakenSessionPhase1`,
  `deleteCenterDependencies`, `updateSeatsTakenInBusLine` et `sendAutoCancelMeetingPoint` (`utils/index.ts`).
  Aussi `switchYoungByIdToLC` et `shouldSwitchYoungByIdToLC`, `validateHeadOfCenterCohortChange`,
  `getAllSessions`, `getFilteredSessionsForCLE`, `getFilteredSessionsForChangementSejour` et
  `cohortQueryBuilder.ts`. Enfin, le cron `autoValidatePhase1`, non planifié (seul `__tester__.ts` le
  référençait).

### Objectifs d'inscription

- Routes `POST /inscription-goal/:cohort`, `GET /inscription-goal/:cohort/department/:department(/reached)` et
  `GET /inscription-goal/:department/current`, et le service `getCompletionObjectifs`. Ses quatre sites de
  contrôle disparaissent : invitation, changement de séjour, validation d'un dossier et changement d'adresse
  (PL9, course TOCTOU sur la jauge).
- Admin : plus de contrôle de jauge avant la validation d'un dossier (liste des inscriptions et pied de fiche).
- `GET /inscription-goal/:cohort` (export des tableaux de bord) reste. Le reste d'`inscriptionGoal` (modèle,
  tableaux de bord, constantes) relève d'une PR de nettoyage ultérieure, sans enjeu de sécurité.
- snu-lib : `canUpdateInscriptionGoals`, `canChangeYoungCohort`, `youngCanChangeSession`,
  `getDepartmentForInscriptionGoal` et les types de routes `InscriptionGoalsRoutes` et
  `CohortsRoutes.PostEligibility` sont retirés.

## 2. Constats fermés

| Constat | Sévérité | Fermé par |
| --- | --- | --- |
| PH15 | élevée | `email` retiré de `validateYoung` : l'email ne se change plus que par `PUT /young-edition/:id/identite`, qui révoque les sessions et prévient l'ancienne adresse |
| PM18 | moyenne | suppression de `POST /young/invite` |
| PM28 | moyenne | champs de présence et de statut de phase 1 retirés de `validateYoung`, dérivation supprimée |
| PM29 | moyenne | suppression de `change-cohort` (branche CLE) et retrait de `classeId` de `validateYoung` |
| PM35 | moyenne | consentements, droit à l'image, attestations et `parentXFromFranceConnect` retirés de `validateYoung` |
| PL9 | faible | suppression des quatre sites de contrôle des objectifs et des routes d'écriture et de contrôle |
| PL23 | faible | phase 1 retirée de `phasestatus` et de `phaseStatusOptionsByRole` ; `getPhaseStatusOptions` renvoie une copie |

Ce lot ferme aussi les vecteurs phase 1 de PH16 (réponse brute de `change-cohort`), de PM15 (message libre
de `change-cohort`) et de PM20 (volet 1, `PUT /young/change-cohort`). Leurs autres volets relèvent de P05 et
de P12.

## 3. Choix

- **Clés retirées de `validateYoung` plutôt que passées en `.forbidden()`** : les écrans renvoient parfois le
  dossier complet. Un 400 casserait des écrans légitimes pour des champs que la route n'écrit de toute façon
  plus. `COHORT_AND_AFFECTATION_FIELDS` et le contrôle `statusPhase1` de `youngStatusTransitions.ts`, devenus
  inatteignables, restent en défense en profondeur.
- **`statusPhase1` explicitement refusé sur `phasestatus`** : cette route ne reçoit qu'un seul statut à la
  fois, jamais un dossier complet. Un refus explicite est plus lisible qu'un 200 silencieux.
- **Pas de migration** : les `placesLeft` des sessions et les `youngSeatsTaken` des lignes ne sont plus
  recalculés et gardent leur dernière valeur.

## 4. Impact fonctionnel

- ADMIN et super-admin perdent la correction manuelle de `statusPhase1`. Un dossier historique mal pointé se
  corrige par script.
- Plus de « Changer de cohorte » côté admin (bascule CLE ↔ HTS et « à venir » compris), plus de « Changer de
  séjour » côté volontaire. Le désistement reste.
- La validation d'un dossier ne contrôle plus la jauge.
- Au changement d'adresse, le statut n'est plus recalculé, et un volontaire affecté peut modifier son adresse.
- Au désistement, l'affectation (session, centre, PDR, ligne, présence) est conservée : l'historique du
  séjour et l'attestation phase 1 d'un volontaire qui a réalisé son séjour restent disponibles.
- Les référents ne modifient plus l'email ni les consentements d'un volontaire par `PUT /referent/young/:id`.
  Seules les routes dédiées le permettent.

## 5. Déploiement

Fronts d'abord (admin et app ensemble), puis api, puis tasks. Les nouveaux fronts n'appellent plus aucune
des routes supprimées et fonctionnent contre l'ancienne API. **L'ordre inverse est interdit** : l'ancien
admin appelle `GET /inscription-goal/:cohort/department/:department` avant de valider un dossier, et
l'ancienne app appelle `POST /cohort-session/eligibility/2023` au changement d'adresse.

apiv2 : aucun changement de code. snu-lib perd des symboles qu'apiv2 n'utilise pas, d'où un simple
type-check en CI. Aucune migration, aucune variable d'environnement.

Après déploiement : confirmer qu'aucun volontaire n'est encore `AFFECTED`.
