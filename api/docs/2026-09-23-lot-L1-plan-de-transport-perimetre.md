# Lot L1 — périmètre du plan de transport (M21, M22, M60, M61, M62, L17, L34)

Audit du 2026-09-21. Vérifié et corrigé le 2026-09-23 sur `origin/main` @ `68e7252c4`
(branche `fix/goo-25-lot-L1-plan-de-transport`, ticket Linear GOO-25).

## 1. Constat

Tous les constats étaient encore ouverts sur `origin/main`.

| Id | Route | Défaut | Correctif |
| --- | --- | --- | --- |
| M21 | `/demande-de-modification/*` | aucun périmètre : un référent régional créait une demande et écrivait dans le fil de n'importe quelle ligne ; tout référent lisait les demandes de toute ligne | chaque route charge la ligne et vérifie son périmètre |
| M22 | `POST /edit-transport/saveYoungs` | chaque objet de `data` était recopié champ par champ sur le document Young (tout champ du modèle) | liste blanche d'affectation, transfert vérifié |
| M60 | `PUT /ligne-de-bus/:id/team`, `/:id/teamDelete` | fenêtre d'édition ouverte = n'importe quelle ligne de France | périmètre de la ligne |
| M61 | `PUT /ligne-de-bus/:id/pointDeRassemblement` | horaire et type de transport modifiables par tout référent, sans périmètre ni fenêtre | périmètre + `isPdrEditionOpen` |
| M62 | `GET /ligne-de-bus/patches/filter-options` | aucun contrôle ; auteurs renvoyés avec email, rôle et département | garde de `/patches/:cohort`, auteurs réduits au nom, options limitées au périmètre |
| L17 | `GET /ligne-to-point/meeting-point/:id` | `LIGNE_BUS:READ` posée avec `ignorePolicy` : toute liaison lisible | périmètre du point de rassemblement |
| L34 | `PUT /point-de-rassemblement/delete/cohort/:id` | retrait d'une cohorte d'un PDR de n'importe quel territoire | `canUpdateMeetingPoint` + `isPdrEditionOpen`, comme l'ajout |

## 2. Correctifs

### 2.1 Périmètre d'une ligne — `canActOnLigneBus`

Nouveau helper dans `services/sejourAccess.ts`. Une ligne relève du périmètre de son centre de
destination (`isLigneBusInUserScope`, déjà utilisé par les lectures du lot 5). Le transporteur
reste un acteur national : il garde toutes les lignes, sous réserve des fenêtres d'édition que
chaque route vérifie déjà. Les autres rôles (chefs de centre, référents sanitaires, inactifs
depuis 2025) sont refusés.

### 2.2 M21 — demandes de modification

- `POST /` : périmètre de la ligne, vérifié avant la fenêtre `isTransportPlanCorrectionRequestOpen`.
- `PUT /:id/status|opinion|message|tag/*` : la demande est rattachée à sa ligne (`lineId`) et le
  périmètre de celle-ci est vérifié. Statut, avis et tags restent réservés à l'admin et au
  transporteur ; le contrôle ne change rien pour eux, il ferme `message` aux référents régionaux
  hors périmètre.
- `GET /ligne/:id` : la ligne doit exister (404 sinon) et être dans le périmètre.

Les documents renvoyés ne portent ni jeton ni secret (nom et rôle du demandeur, messages) : pas
de sérialisation supplémentaire, le cloisonnement suffit.

### 2.3 M22 — déplacement de jeunes

`data` est validé par un schéma Joi avec `stripUnknown` : seuls `_id`, `ligneId`,
`meetingPointId` et `sessionPhase1Id` sont conservés. Le transfert est vérifié :

- chaque jeune doit être rattaché à `busFrom` (sinon 403, rien n'est écrit) ;
- `ligneId` doit être `busTo`, `meetingPointId` l'un de ses PDR et `sessionPhase1Id` sa session
  (sinon 400).

Le front (`admin/src/scenes/edit-transport/deplacement`) envoie exactement ces valeurs. Il envoie
aussi `cohensioncenterId` (faute de frappe) : ce champ n'existe pas dans le modèle Young et n'a
donc jamais été écrit. Le comportement est inchangé ; mettre à jour `cohesionCenterId` lors d'un
changement de ligne serait un correctif fonctionnel distinct.

### 2.4 M60, M61 — édition d'une ligne par un référent

`canActOnLigneBus` après les contrôles de rôle et de fenêtre existants. Pour
`/:id/pointDeRassemblement`, un référent doit en plus avoir la fenêtre `isPdrEditionOpen`
ouverte pour la cohorte. Seul l'écran admin `edit-transport` appelle cette route : aucun parcours
référent n'est cassé.

### 2.5 M62 — options de filtre de l'historique

- Même garde que `/patches/:cohort` : `PATCH:READ` et au moins un centre dans le périmètre.
- Pour un non-admin, les `distinct` sont restreints aux patches des lignes (et liaisons) de son
  périmètre (`ref`).
- Les auteurs ne sortent plus qu'avec `_id`, `firstName`, `lastName` : c'est tout ce que le
  filtre affiche (`HistoricServerDriven`).
- La clé `team` est retirée des chemins proposés à qui ne voit pas l'équipe de convoyage, comme
  les entrées elles-mêmes dans `/patches/:cohort`.

### 2.6 L17, L34 — points de rassemblement

- `GET /ligne-to-point/meeting-point/:id` : `isPointDeRassemblementInUserScope` sur le PDR. La
  route n'a plus d'appelant dans les fronts ; elle est conservée et cloisonnée.
- `PUT /point-de-rassemblement/delete/cohort/:id` : mêmes gardes que `PUT /cohort/:id`.

## 3. Tests

`api/src/__tests__/plan-de-transport-perimetre-lot-l1.test.ts` (22 cas) : pour chaque route, un
référent hors périmètre est refusé et le document n'est pas modifié, un référent du périmètre
passe. Contrôle inverse : sans le correctif, les 16 cas de refus échouent et seuls les 6 cas
légitimes passent.

- La permission `PATCH:READ` est seedée pour le responsable : son refus sur `filter-options`
  vient du périmètre, pas de l'absence de permission.
- Les fenêtres (`isTransportPlanCorrectionRequestOpen`, `pdrEditionOpenFor*`,
  `informationsConvoyage`) sont ouvertes dans le jeu, sinon les refus seraient dus à la fenêtre.
- Les noms de cohorte sont uniques par exécution : la base de test persiste entre deux
  lancements et `CohortModel.findOne({ name })` retrouvait une cohorte d'un run précédent.

## 4. Reste à faire

- Aucune action en production.
