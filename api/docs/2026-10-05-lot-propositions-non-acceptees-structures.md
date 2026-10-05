# Lot GOO-146 — api, apiv2, snu-lib : une proposition non acceptée n'ouvre rien à la structure

Audit de sécurité de la production du 25/09/2026, constats PH1, PH2, PH11, H66, H67 et H1 (ticket
Linear GOO-146). Vérifiés ouverts le 2026-10-05 sur `origin/main` @ `b46218e79`, puis corrigés.
Complète le lot P02 (`2026-09-26-lot-p02-candidatures-hors-flux.md`), qui avait écarté du périmètre
d'une structure les propositions en attente (`WAITING_ACCEPTATION`).

Principe commun : une proposition de mission est une candidature créée par un administrateur ou un
référent territorial, que le volontaire accepte en la passant en attente de validation. Tant qu'il ne
l'a pas acceptée, elle ne relève pas de la structure, **quel que soit son statut courant** : elle
peut sortir de `WAITING_ACCEPTATION` sans acceptation (annulation à J+14, annulation ou archivage de la
mission, refus, décision du volontaire).

## 1. Règles rétablies

| Règle | Avant | Après |
| --- | --- | --- |
| Une structure ne crée pas de candidature | `POST /application` acceptait un responsable ou un superviseur pour la mission de sa structure ; seul le statut du volontaire était contrôlé | 403 pour ces deux rôles. Administrateur, référents territoriaux et volontaire inchangés |
| Aucune suite de changements de statut ne mène une proposition non acceptée à `VALIDATED`, `IN_PROGRESS` ou `DONE` | La matrice des structures jugeait chaque saut à partir du statut stocké (`WAITING_ACCEPTATION` vers `REFUSED`, puis `REFUSED` vers `VALIDATED`…) | `WAITING_ACCEPTATION` sort de la matrice, et `PUT /application`, `POST /application/multiaction/change-status`, `POST /application/:id/notify/:template` et `POST /contract` refusent (403) toute écriture d'une structure sur une proposition non acceptée, quel que soit son statut |
| Un volontaire dont le seul lien avec la structure est une proposition non acceptée est hors de son périmètre | Seule `WAITING_ACCEPTATION` était écartée, et seulement dans `youngScope.ts` | Marqueur sur la candidature, appliqué dans chaque copie du périmètre (section 2) |

Les parcours existants sont conservés : le volontaire candidate puis la structure valide, la mission
passe `IN_PROGRESS` puis `DONE` avec saisie des heures (`missionDuration` reste libre pour la
structure sur `PUT`, c'est cette saisie) ; la structure refuse une candidature puis la revalide ; un
volontaire qui accepte une proposition la rend ordinaire ; administrateur et référents territoriaux
gardent toutes leurs transitions.

## 2. Marqueur `proposalNotAccepted`

Champ booléen de la candidature (snu-lib, `ApplicationSchema`), tenu par un hook de sauvegarde du
modèle (`api/src/models/application.ts`, règles dans `api/src/application/applicationProposal.ts`),
parce que le statut change par plusieurs chemins (volontaire, référents, lot, crons, annulation de
mission) :

- posé quand la candidature est en `WAITING_ACCEPTATION` (création ou remise en proposition) ;
- conservé à la sortie vers `REFUSED` ou `CANCEL`, y compris pour une proposition qui n'en portait pas
  encore (le hook lit le statut d'avant) ;
- levé quand le volontaire accepte (`WAITING_VALIDATION`, `WAITING_VERIFICATION`) ou quand un
  administrateur ou un référent territorial engage la candidature (`VALIDATED`, `IN_PROGRESS`, `DONE`).

Le filtre commun `NOT_A_PROPOSAL` (`status != WAITING_ACCEPTATION` et `proposalNotAccepted != true`) est
appliqué à :

- `isYoungInStructureScope`, `isYoungInMilitaryPreparationStructureScope`, `getApplicationScopeFilter`
  (dossier du volontaire, pièces, `GET /young/:id/application`) ;
- l'index ES des volontaires (`buildYoungContext`) et le périmètre des notifications mail
  (`emailNotificationScope.ts`), qui n'avaient pas le filtre ;
- `GET /mission/:id/application` ;
- l'index ES des candidatures (`buildApplicationContext`), `GET /application/:id` et les pièces de
  candidature (`isApplicationInUserScope`) ;
- apiv2 : le périmètre de l'export des volontaires d'une structure (`CandidatureRepository`) et
  l'export des candidatures d'une mission (`ExportMissionService.ecarterPropositions`).

## 3. Choix

- **`POST /application` fermé aux structures** plutôt que subordonné à un lien préalable : aucun
  parcours visible ne l'utilise pour ces rôles. Le seul appelant côté admin (`createApplication`) passe
  par l'onglet « Proposer cette mission », déjà interdit aux structures
  (`scenes/missions/view/wrapper.tsx`), et la page « Proposer une mission » d'un volontaire n'est pas
  montée pour elles.
- **Marqueur plutôt que statut seul** : sans lui, une proposition annulée par le cron ou par le
  volontaire redevient indiscernable d'une candidature refusée.
- **Comportement visible, commit séparé** (`visible : …`) : une structure ne voit plus dans ses listes
  la candidature « Annulée » ou « Refusée » née d'une proposition non acceptée. Les candidatures du
  volontaire lui-même, même refusées ou annulées, restent visibles.
- `missionDuration` n'est pas borné pour les structures sur `PUT /application` : c'est la saisie des
  heures réalisées à `DONE`.

## 4. Fichiers touchés

`api/src/application/applicationProposal.ts` (nouveau), `applicationController.ts`,
`api/src/models/application.ts`, `api/src/young/youngStatusTransitions.ts`,
`api/src/young/youngScope.ts`, `api/src/services/contractAccess.ts`, `api/src/controllers/contract.ts`,
`api/src/controllers/mission.ts`, `api/src/controllers/elasticsearch/young.ts`,
`api/src/controllers/elasticsearch/utils.ts`, `api/src/email/emailNotificationScope.ts`,
`api/src/anonymization/application.js`, `packages/lib/src/mongoSchema/application.ts`,
`apiv2/src/admin/core/engagement/mission/ExportMission.service.ts`,
`apiv2/src/admin/core/engagement/mission/ExporterMissionCanditatures.ts`,
`apiv2/src/admin/infra/engagement/candidature/repository/mongo/CandidatureMongo.repository.ts`.

## 5. Tests

- `api/src/__tests__/application-structure-transitions.test.ts` : énumération de toutes les chaînes de
  transitions ouvertes à un responsable et à un superviseur (rien ne sort de `WAITING_ACCEPTATION`,
  rien ne bouge sur une proposition marquée, parcours légitimes inchangés, administrateur et
  référents territoriaux sans restriction).
- `api/src/__tests__/application-proposition-non-acceptee.test.ts` : cycle de vie du marqueur ; I1
  (`PUT` et lot, pour chaque statut de départ et chaque statut visé) ; I2 (dossier, candidatures du
  volontaire, liste de la mission, index ES des volontaires et des candidatures, périmètre mail,
  `GET /application/:id`, notifications) pour `WAITING_ACCEPTATION`, `REFUSED` et `CANCEL` ; I3
  (`POST /application` refusé) ; I4 (parcours légitimes, administrateur, référent départemental,
  acceptation d'une proposition).
- `contract.test.ts` : `POST /contract` sur une proposition non acceptée. `lot-p02-candidatures.test.ts`
  et `application-security.test.ts` : les cas qui attendaient qu'une structure crée une proposition
  attendent le refus.
- apiv2 : `ExporterMissionCanditatures.propositions.spec.ts` et
  `test/admin/engagement/CandidatureMongo.repository.spec.ts` (base réelle).

## 6. Après déploiement

- Déployer api, apiv2 et snu-lib ensemble (snu-lib est embarqué au build) ; aucune migration. Le champ
  est mappé dynamiquement dans l'index ES `application` dès le premier document qui le porte.
- Le marqueur est posé à partir du déploiement : une proposition encore en attente est marquée à sa
  sortie (hook), mais les candidatures déjà `REFUSED` ou `CANCEL` ne sont pas reclassées. Pour les
  repérer en lecture seule : candidatures `REFUSED` ou `CANCEL` dont l'historique de patches
  (collection `application_patches`) montre un premier statut `WAITING_ACCEPTATION` et aucun passage par
  `WAITING_VALIDATION` ni `WAITING_VERIFICATION`. Revue humaine avant de poser le marqueur.
