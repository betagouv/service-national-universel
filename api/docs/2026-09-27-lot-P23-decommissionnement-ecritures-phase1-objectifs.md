# Lot P23 — décommissionnement des écritures phase 1 et des objectifs d'inscription

Audit de sécurité de la production du 25/09/2026, constats PH15, PM18, PM28, PM29, PM35, PL9 et PL23
(ticket Linear GOO-65). Décision produit du 25/09/2026 : les écritures qui ne concernent que la
phase 1 sont **retirées**, pas corrigées ; les lectures phase 1 restent. La correction manuelle de
`statusPhase1` est retirée sans exception, super-administrateur compris (un dossier historique mal
pointé se corrigera par script).

Suite de `2026-09-24-phase1-ecritures-supprimees.md`, qui laissait hors périmètre les routes mixtes.

## 1. Routes supprimées

| Domaine                   | Routes                                                                                                                                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changement de séjour      | `PUT /referent/young/:id/change-cohort`, `GET /young/change-cohort`, `PUT /young/change-cohort`, `POST /cohort-session/eligibility/2023/:id?`                                                         |
| Invitation de volontaires | `POST /young/invite` (sans appelant ; `/young/signup_verify` et `/young/signup_invite` restent pour les invitations déjà envoyées)                                                                    |
| Objectifs d'inscription   | `POST /inscription-goal/:cohort`, `GET /inscription-goal/:cohort/department/:department`, `GET /inscription-goal/:cohort/department/:department/reached`, `GET /inscription-goal/:department/current` |

Conservées : `GET /inscription-goal/:cohort` (export du tableau de bord) et
`GET /cohort-session/isInscriptionOpen`.

## 2. Routes mixtes : ce qui n'est plus écrit

| Route                                | Retiré                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Conservé                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `PUT /referent/young/:id`            | schéma `validateYoung` : cohorte et classe, statut / présence / départ / affectation phase 1, `email`, consentements des représentants légaux, droit à l'image et marqueurs FranceConnect (clés ignorées, pas rejetées) ; contrôle d'objectif d'inscription ; remise à zéro phase 1 en réinscription ; `statusPhase1` dérivé de la présence et email d'arrivée au centre ; libération de l'affectation au désistement ; recalcul des places de session et de bus ; bascule en liste complémentaire | statuts d'inscription, phases 2 et 3, contrôle cohorte / fin d'instruction à la validation, notification de désistement |
| `PUT /young/withdraw`                | remappage `statusPhase1` et remise à zéro de l'affectation, recalcul des places                                                                                                                                                                                                                                                                                                                                                                                                                    | désistement et notifications                                                                                            |
| `PUT /young/account/address`         | blocage d'un volontaire affecté, recalcul de l'éligibilité au séjour et du statut d'inscription                                                                                                                                                                                                                                                                                                                                                                                                    | adresse, QPV, densité, notification de changement de département                                                        |
| `PUT /young-edition/:id/phasestatus` | `statusPhase1` (400, toute clé hors schéma est refusée) et ses effets sur l'affectation                                                                                                                                                                                                                                                                                                                                                                                                            | `statusPhase2`, `statusPhase3`                                                                                          |

`snu-lib` : `getPhaseStatusOptions` n'a plus d'entrée phase 1 et renvoie une copie de la matrice
partagée ; `canChangeYoungCohort`, `canUpdateInscriptionGoals` et `youngCanChangeSession` sont
supprimés.

Code orphelin supprimé : helpers de sessions éligibles (`getAllSessions`, `getFilteredSessionsForCLE`,
`getFilteredSessionsForChangementSejour`, `cohortQueryBuilder`), service `inscription-goal`,
`validateHeadOfCenterCohortChange`, bascule en liste complémentaire (`youngService`),
`updatePlacesSessionPhase1`, `updateSeatsTakenInBusLine` et trois utilitaires sans appelant de
`utils/index.ts`, le cron `autoValidatePhase1` (non planifié).

## 3. Effets visibles

**Admin** : plus de crayon ni de modale de changement de cohorte (le badge « Anciennement … » reste) ;
plus de ligne « Phase 1 » dans « Statuts de phases » ; plus de contrôle de jauge ni de modale
« Jauge de candidats atteinte » avant la validation d'un dossier (l'avertissement liste
complémentaire reste).

**Moncompte** : `/changer-de-sejour` ne sert plus que le désistement ; les liens « Changer mes dates
de séjour » sont retirés ; le changement d'adresse enregistre l'adresse sans choix de séjour.

## 4. Vérification

Nouveaux cas dans `phase1-ecritures-supprimees.test.ts` (routes supprimées → 404 Express, lectures
conservées, champs ignorés sur les routes mixtes, affectation conservée au désistement, `statusPhase1`
refusé sur `phasestatus`) et `roles.spec.ts` (options de phase, copie défensive), écrits en échec
avant la correction. Suites existantes adaptées au nouveau comportement.
