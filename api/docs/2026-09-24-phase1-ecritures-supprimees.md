# Phase 1 en lecture seule : suppression des écritures

Date : 2026-09-24 · Décision produit du 24/09 · Branche `fix/phase1-ecritures-supprimees`, empilée sur
`fix/goo-37-lot-j-reservation-places` (PR #5395)

## Décision

Plus aucune création, modification ni suppression, par l'API, sur :

- les points de rassemblement ;
- la réservation des places ;
- les lignes de bus et le plan de transport ;
- les sessions et les centres ;
- la présence, le départ et la dispense ;
- les traitements de masse phase 1 d'apiv2.

Les routes sont **supprimées**, pas verrouillées. Les lectures sont conservées.

Hors périmètre, inchangées : les routes « mixtes » qui touchent des champs phase 1 en passant (`PUT /referent/young/:id`,
changement de cohorte, `phasestatus`, désistement, suppression logique du jeune…).

Cette suppression rend caduc le code de réservation atomique introduit par #5395 (lot J, M57/L25) : les routes qu'il
protégeait n'existent plus, et `utils/placeReservation.ts` est supprimé. M57 et L25 sont fermés par construction.

## Routes supprimées

### api v1

| Domaine                      | Routes                                                                                                                                                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Points de rassemblement      | `PUT /point-de-rassemblement/cohort/:id`, `PUT /point-de-rassemblement/delete/cohort/:id`, `POST /point-de-rassemblement/import` (et l'ancien code commenté de création/modification/suppression)                             |
| Lignes de bus                | `PUT /ligne-de-bus/:id/{info,team,teamDelete,centre,pointDeRassemblement,updatePDRForLine}`, `POST /ligne-de-bus/:id/point-de-rassemblement/:meetingPointId`, `DELETE /ligne-to-point/:id`, `POST /edit-transport/saveYoungs` |
| Demandes de modification     | `POST /demande-de-modification`, `PUT /demande-de-modification/:id/{status,opinion,message}`, `PUT /demande-de-modification/:id/tag/:tagId` (+ `/delete`)                                                                     |
| Affectation / places         | `POST /young/:id/phase1/affectation`, `PUT /young/:id/point-de-rassemblement`, `PUT /young/:id/meeting-point` (+ `/cancel`), `POST /bus`, `PUT /bus/:id/capacity`                                                             |
| Sessions                     | `PUT /session-phase1/:id`, `PUT /session-phase1/:id/{directionTeam,team}`, `DELETE /session-phase1/:id`, `POST /session-phase1/:id/:key`, `DELETE /session-phase1/:sessionId/:key/:fileId`, `POST /session-phase1/import`     |
| Centres                      | `PUT /cohesion-center/:id/session-phase1`, `DELETE /cohesion-center/:id`, `POST /cohesion-center/import`                                                                                                                      |
| Présence / départ / dispense | `POST /young/:id/phase1/{dispense,depart,:key}`, `PUT /young/:id/phase1/depart`, `POST /young/phase1/multiaction/{depart,:key}`, `PUT /young/phase1/:document`, `PUT /referent/young/:id/phase1Status/:document`              |

Conservées : toutes les `GET`, ainsi que les `POST` qui n'écrivent pas en base (`/ligne-de-bus/:id/notifyRef`,
`/edit-transport/youngs`, `/edit-transport/meetingPoints`, attestations, export droit à l'image, relances d'emploi du
temps et de projet pédagogique).

Le code devenu orphelin est supprimé :

- les imports PDR, sessions et centres ;
- dans `ligneDeBusService`, tout sauf les lectures ;
- les notifications de ligne et de session ;
- `placeReservation` ;
- les validateurs dédiés ;
- `autoValidationSessionPhase1Young` et `handleNotificationForDeparture` ;
- quelques utilitaires sans autre appelant.

`updatePlacesSessionPhase1` et `updateSeatsTakenInBusLine` restent : les routes mixtes les appellent encore.

### apiv2

- `POST /affectation/:sessionId/simulation/{hts,hts-dromcom,cle,cle-dromcom}` et les quatre `…/valider/…`
- `POST /affectation/:sessionId/ligne-de-bus/sync-places`, `…/centre/sync-places`, `…/centre/:centreId/sync-places`
- `DELETE /phase1/:sessionId/plan-de-transport`, `DELETE /phase1/:sessionId/ligne-de-bus/:ligneId`
- `POST /desistement/:sessionId/simulation` (+ `valider`)
- `POST /inscription/:sessionId/bascule-jeunes-{valides,non-valides}/simulation` (+ `valider`)
- `POST /referentiel/import/{classes,routes}` répond 422 `IMPORT_NOT_VALID`. Les référentiels géographiques (régions
  académiques, départements, académies) restent importables.

Les use cases correspondants sont supprimés : simulations, validations, désistement, bascule, suppression du plan de
transport, import de classes et de routes.

Une tâche d'un type supprimé restée en file est marquée en échec avec un message explicite (`ADMIN_TASKS_SUPPRIMEES`
dans `AdminTask.consumer.ts`), sans faire tomber le worker. `SimulationAffectationHTS.service` est conservé : le rapport
PDF des simulations existantes (`GET /affectation/simulation/hts/:id/analytics`) en dépend.

## Effets visibles

**Admin**

- Fiches ligne de bus en lecture seule : informations, équipe, points de rassemblement, centre, demandes de
  modification.
- Sessions et équipes de centre en lecture seule.
- Supprimés :
  - les modales de pointage (arrivée, JDM, fiche sanitaire, départ, en masse) ;
  - l'affectation manuelle et la dispense ;
  - la création et l'import de PDR ;
  - le rattachement d'un centre à une cohorte ;
  - la page de déplacement de jeunes entre lignes ;
  - l'onglet « Actions » des opérations de masse.
- Les historiques de simulations et de traitements restent consultables, rapports compris.
- Le rôle « Chef de centre » est retiré de l'invitation : sans écriture de `directionTeam`, il ne pourrait plus être
  rattaché à une session. Ce rôle est inactif depuis septembre 2025.

**Moncompte (jeune affecté)**

- Le point de rassemblement choisi (ou le déplacement autonome) s'affiche sans bouton « Modifier ».
- Sans choix enregistré, l'écran indique que le choix n'est plus disponible.
- La convocation et la fiche sanitaire restent téléchargeables et envoyables par email. Leur téléchargement n'est plus
  enregistré.
- La confirmation de participation n'est plus possible en ligne ; une confirmation déjà enregistrée reste affichée.

## Vérification (Node 20, en série)

| Contrôle                                                                                         | Résultat                                                                                            |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| api — `phase1-ecritures-supprimees` (nouveau) : 54 écritures → 404, 11 lectures toujours servies | 65/65                                                                                               |
| api — 66 suites concernées (sécurité jeune, référent, sessions, centres, plan de transport…)     | 66/66 suites, 1179 tests passés (15 ignorés, 1 todo)                                                |
| apiv2 — suite complète                                                                           | 86 suites, 649 passés (1 ignoré) ; `Phase1EcrituresSupprimees.spec` : 19 routes → 404, lectures 200 |
| Type-check api, apiv2, admin, app                                                                | aucune erreur nouvelle par rapport à la base (erreurs d'environnement préexistantes inchangées)     |
| Build admin, build app                                                                           | OK                                                                                                  |

## À suivre

- Nettoyer dans `snu-lib` les définitions devenues sans appelant :

  - les fonctions de `roles.ts` : `isBusEditionOpen`, `canAssignManually`, `canEditLigneBus*`,
    `ligneBusCanCreateDemandeDeModification`, `isSessionEditionOpen`… ;
  - les types de routes apiv2 d'affectation, de désistement, de bascule et de suppression du plan de transport, ainsi
    que les DTO de tâches ;
  - `ACTIONS.TRANSPORT.UPDATE*`.

  Elles ont été laissées pour limiter la taille de cette PR.

- `SimulationAffectationHTS.service` est pour l'essentiel du code mort. En extrayant
  `extractPdfAnalyticsFromRapport`, on pourrait supprimer le service et `Affectation.service`.
- Le parcours moncompte garde l'en-tête « 4 étapes ». Un jeune qui n'a pas terminé ne pourra plus atteindre « Bravo,
  vous avez fini ! » : formulation à revoir.
- Les routes mixtes peuvent toujours écrire des champs phase 1 : présence et départ via `PUT /referent/young/:id` pour
  un référent dans son périmètre, et session, centre ou PDR pour un admin. Les fermer demande une décision distincte.
