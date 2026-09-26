# Lot P10 — api : périmètre des lectures phase 1 et transport

Audit de sécurité de la production du 25/09/2026, constats PH7, PH10 (élevée), PM9, PM14, PM34
(moyenne) et PL8 (faible) (ticket Linear GOO-63). Vérifié ouvert puis corrigé le 2026-09-26 sur
`origin/main` @ `bec7704ea`. Ce sont des lectures : elles restent en service malgré la phase 1 en
lecture seule (décision du 24/09), donc se corrigent au lieu d'être retirées.

## 1. Constats et correctifs

| Constat | Route / fichier | Avant | Après |
| --- | --- | --- | --- |
| PH10 | `buildYoungContext` (`elasticsearch/young.ts`) | Les deux blocs `REFERENT_DEPARTMENT` portaient la même condition `!showAffectedToRegionOrDep` (copié-collé) — jamais la branche symétrique de `REFERENT_REGION`. `/in-bus`, `/by-point-de-rassemblement` et `/by-point-de-rassemblement/aggs` (qui passent `showAffectedToRegionOrDep: true`) n'appliquaient donc **aucun filtre département** à un référent départemental : accès national aux jeunes de n'importe quel bus | Bloc symétrique ajouté (`showAffectedToRegionOrDep === true`), sur le modèle du bloc région déjà correct |
| PH7 | `lignebus.js` (`/search`, `/export`), `populateYoung.js` (export jeune avec `ligneId`) | Le tableau `team` d'une ligne de bus (état civil, email, téléphone des accompagnateurs) était servi tel quel à tout rôle admis par `canSearchLigneBus`/`canExportLigneBus`, alors que seul un ADMIN y a droit (`canViewConvoyeurTeam`, déjà utilisé côté C5 mais pas ici) | `serializeLigneBus` appliqué aux réponses de `/search` et `/export`, et à l'objet `bus` attaché par `populateYoungExport` (jeune → export avec bus) |
| PM9 | `plandetransport.js` | Le plan de transport national et les demandes de modification étaient lisibles par tout référent départemental ou régional, sans aucun filtre géographique — à la différence de `lignebus.js`, déjà borné | Même périmètre que `lignebus` (`getLigneBusScope`), adapté aux noms de champs réels (`centerId.keyword`, `pointDeRassemblements.meetingPointId.keyword`) |
| PM14 | `GET /session-phase1/:id/cohesion-center` | `serializeCohesionCenter(cohesionCenter)` sans `req.user` : `isYoung(undefined)` toujours faux, `waitingList` (identifiants d'autres volontaires) jamais retiré pour un jeune | `req.user` passé au sérialiseur |
| PM34 | `GET /young/:id/session` (`serializeSessionPhase1`) | Seul `waitingList` était retiré pour un jeune (M59) ; `team`, `adjointsIds` et `sanitaryContactEmail` (état civil, email, téléphone de l'équipe d'encadrement) restaient renvoyés | Les trois champs retirés sous `isYoung(user)`, sur le modèle de `serializeLigneBusForYoung` (H48) |
| PL8 | `GET /ligne-de-bus/patches/:cohort` | La branche `{ cohortId: cohort._id }` du `$or` s'appliquait à tout appelant, contournant le périmètre par centre pour un référent scopé. L'auteur d'un patch (`doc.user`) était renvoyé en entier (email, rôle, département), contrairement à `/patches/filter-options` (déjà projeté) | Branche `cohortId` réservée à `scopedCenterIds === null` (ADMIN) ; `doc.user` projeté sur `{_id, firstName, lastName}` pour un non-admin, dans les deux boucles (lignebus et lignetopoint) |

## 2. Choix

- Les branches chef de centre / transporteur de ces fichiers ne sont **pas** supprimées ici : elles
  partent en P25 (décommissionnement), en même temps que le rôle est retiré du contrôle d'entrée.
- PM8 (garde `canViewSejourHistory` sur `cohesioncenter.js` /presence) n'est **pas** dans ce lot : il
  est déjà couvert par P24 (GOO-56, verrou des rôles décommissionnés) et n'apparaît pas dans le
  périmètre du ticket GOO-63.
- PH7 ferme le vecteur `lignebus.js` **et** le vecteur `populateYoung.js` (export jeune avec
  `ligneId`), tous deux réutilisant `serializeLigneBus`/`canViewConvoyeurTeam` déjà en place — pas de
  nouveau mécanisme.

## 3. Fichiers touchés

`api/src/controllers/elasticsearch/young.ts`, `api/src/controllers/elasticsearch/populate/populateYoung.js`,
`api/src/controllers/elasticsearch/cle/young.js`, `api/src/controllers/elasticsearch/lignebus.js`,
`api/src/controllers/elasticsearch/plandetransport.js`,
`api/src/planDeTransport/ligneDeBus/ligneDeBusController.ts`, `api/src/controllers/session-phase1.ts`,
`api/src/utils/serializer.js`.

## 4. Tests

- `elasticsearch-perimeter.test.ts` : nouveaux describe PH7 (team retiré de `/search` et `/export`
  hors ADMIN) et PH10 (`/in-bus`, `/by-point-de-rassemblement`, `/by-point-de-rassemblement/aggs`
  bornés au département).
- `elasticsearch-lot-l4.test.ts` : nouveau describe PM9 (plandetransport borné, admin/transporteur
  nationaux).
- `session-phase1-perimetre.test.ts` : nouveau describe PM14 (waitingList retiré au volontaire, gardé
  au référent).
- `young-session-eligibility-security.test.ts` : nouveau cas PM34 dans le describe M59 existant (team,
  adjointsIds, sanitaryContactEmail retirés au volontaire).
- `plan-de-transport-perimetre-lot-l1.test.ts` : nouveau describe PL8 (branche cohortId réservée à
  l'admin, auteur d'un patch projeté pour un référent scopé).
- RED vérifié pour chacun des 6 constats en stashant isolément le fichier de production concerné :
  chaque test échoue exactement comme décrit sur le code d'avant correctif.
- Régression : `elasticsearch-perimeter`, `elasticsearch-lot-l4`, `plan-de-transport-perimetre-lot-l1`,
  `session-phase1-perimetre`, `young-session-eligibility-security` (91 cas), `cle-perimetre-security`,
  `elasticsearch-scope` (75 cas), `young-patches-security` — tous verts. `tsc --noEmit` propre.

## 5. Après déploiement

Chercher dans les journaux les exports `in-bus` et `by-point-de-rassemblement` faits par des
référents départementaux hors de leur département avant ce correctif : le code n'a pas changé depuis
juillet 2025.
