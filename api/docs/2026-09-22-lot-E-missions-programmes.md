# Lot E — missions et programmes (H29, H30, H31, M19, M20, H33, M26)

Audit du 2026-09-21. Vérifié, démontré et corrigé le 2026-09-22 sur `origin/main` @ `6de84af33`, puis rebasé sur `17dd49405`
(branche `feat/audit-securite-api-lot-e-7b4d7e`).

Les sept entrées étaient bien ouvertes : ni `api/src/controllers/mission.ts` ni
`api/src/controllers/program.ts` n'avaient été touchés depuis l'audit.

## 1. Vérification

| Id | Constat de l'audit | Vérifié | Précision |
| --- | --- | --- | --- |
| H29 | `PUT /mission/:id` : policy évaluée sur le corps de la requête | oui | `mission.ts:159` passait `mission: checkedMission`. La policy `MissionSameStructureFull` a deux clauses `where` dans un même objet, et `isAuthorized` fait un `authorized.some(...)` (`accessControl.ts:59`) : la clause `mission.structureId === referent.structureId` évaluée sur le corps suffisait. |
| H30 | `change-tutor` : `break` à la première mission autorisée | oui | `mission.ts:308-325`, puis écriture sur tout le lot. |
| H31 | `GET /mission/:id/application` sans rapprochement | oui | `mission.ts:429` : `MISSION READ` avec `ignorePolicy`, puis `find({ missionId })`. |
| M19 | champs libres du validateur de mission | oui, partiellement | `status`, `placesLeft`, `tutorId` sont bien libres. `visibility` ne l'est pas réellement : le schéma mongoose l'énumère (`VISIBLE` / `HIDDEN`) et c'est la bascule « ouverte / fermée aux candidatures » que la structure porteuse utilise légitimement — voir § 4. |
| M20 | `GET /mission/:id/patches` sans périmètre | oui, avec une correction | l'audit cite « responsable et superviseur ». Le **responsable** n'a ni `USER_HISTORY:READ` ni `PATCH:READ` (migrations 20250624122150 / 20250801060707) : il était déjà refusé par `patches.get`. Le vecteur réel est le **superviseur** (`USER_HISTORY:READ` ajoutée par la migration 20250801060707), en plus des référents au périmètre national. |
| H33 | `PUT /program/:id` : autorisation évaluée sur le corps | oui | `program.ts:40`, le programme stocké n'était chargé qu'ensuite (`:42`). |
| M26 | `visibility: "NATIONAL"` pour un référent dep/région | oui | `canCreateOrUpdateProgram` (`roles.ts:557`) ne regardait pas `visibility`. Le front, lui, réserve déjà « Nationale » à l'admin et « Régionale » à l'admin et au référent régional (`admin/src/scenes/content/edit.jsx:193`). |

### Un point qui change la forme du correctif

`MISSION_READ` est seedée **sans policy** pour le superviseur (migration 20250624122150). Sur la base
vérifiée (`6de84af33`), `hasUnrestrictedPermission` court-circuitait l'évaluation des policies dès
qu'une permission sans policy existait : `isReadAuthorized` répondait vrai pour n'importe quelle
mission, et poser un `isReadAuthorized` sur la mission stockée n'aurait **rien fermé** pour H31 et M20.

Ce lot a ensuite été rebasé sur `17dd49405`, qui embarque la précédence des policies de **H87**
(#5343) : une permission large sans policy n'annule plus une policy écrite sur la même
ressource/action. `isReadAuthorized` est donc désormais cloisonnant pour le superviseur — mais
seulement tant que la permission scopée correspondante existe en base.

Les deux routes de lecture passent malgré tout par un contrôle explicite (`isMissionInUserScope`),
sur le modèle déjà utilisé pour les contrats (`services/contractAccess.ts`) : structure pour le
responsable, réseau pour le superviseur, refus par défaut pour tout rôle sans périmètre. Il ne dépend
d'aucun seed, pose exactement les mêmes axes que les policies d'écriture (vérifié rôle par rôle :
administrateur et référents au périmètre national, responsable sur sa structure, superviseur sur sa
structure ou le réseau dont il est la tête), et reste correct si le catalogue de permissions dérive.

## 2. Démonstration

Deux suites ajoutées, jouées avant correctif (rouge) puis après (vert) :

- `api/src/__tests__/mission-security.test.ts` — 19 tests, dont 14 rouges avant correctif
- `api/src/__tests__/program-security.test.ts` — 9 tests, dont 5 rouges avant correctif

Les permissions y sont seedées à l'identique de la production (mêmes migrations), y compris
`MISSION_READ` sans policy pour le superviseur : sans cela les tests de H31 / M20 auraient été verts
pour la mauvaise raison.

Exploits reproduits :

- **H29** — un responsable de la structure A envoie `PUT /mission/<mission de B>` avec
  `structureId = A` : 200 avant correctif, la mission changeait de structure et de nom.
- **H30** — un lot `{ ids: [mission de A, mission de B] }` : la mission de B changeait de tuteur.
- **H31** — `GET /mission/<mission de B>/application` : identité, e-mail et statut des candidats
  renvoyés à un responsable de A et à un superviseur hors réseau.
- **M19** — un responsable posait `status: VALIDATED` (création comme modification) et
  `placesLeft: 9999`, et désignait comme tuteur un référent d'une autre structure.
- **M20** — `GET /mission/<mission hors réseau>/patches` : historique complet pour un superviseur.
- **H33** — un référent départemental réécrivait un programme d'un autre département en envoyant
  son propre département dans le corps, et un référent régional un programme national.
- **M26** — un référent départemental créait un programme `visibility: "NATIONAL"`.

## 3. Correctifs

### `api/src/services/missionAccess.ts` (nouveau)

- `isMissionInUserScope(user, mission)` — périmètre de lecture, fail-closed.
- `isTutorAllowedForMission(tutorId, mission)` — le tuteur doit être un référent de la structure
  porteuse ou d'une structure de son réseau.
- `checkMissionPayload({ user, payload, storedMission })` — liste blanche par rôle :
  - `status` : `VALIDATED`, `REFUSED`, `WAITING_CORRECTION` réservés aux administrateurs et
    référents ; la structure porteuse ne pose que `DRAFT`, `WAITING_VALIDATION`, `CANCEL`,
    `ARCHIVED` — exactement ce que propose `SelectStatusMissionV2` côté front ;
  - `placesLeft` : champ dérivé, retiré du corps pour les rôles non nationaux (aligné sur
    `placesTotal` à la création, recalculé par le contrôleur à la modification) ;
  - `structureId` : un changement de structure porteuse est réservé à l'administrateur, qui dispose
    de la route dédiée `PUT /mission/:id/structure/:structureId` ;
  - `tutorName` : toujours recalculé, jamais repris du corps.

### `api/src/controllers/mission.ts`

- `PUT /:id` : autorisation évaluée sur `mission.toJSON()` (H29) + `checkMissionPayload` (M19).
- `POST /` : `checkMissionPayload` (M19). L'autorisation reste évaluée sur le corps, ce qui est
  correct à la création : le corps *est* l'objet créé, et la structure est chargée depuis lui.
- `POST /multiaction/change-tutor` : **toutes** les missions du lot doivent être autorisées (H30),
  le tuteur doit appartenir à la structure de chacune, et `tutorName` est recalculé.
- `GET /:id/application` : mission chargée, `isMissionInUserScope` (H31). L'identifiant est
  désormais validé comme ObjectId (400 au lieu d'un 500 sur `CastError`).
- `GET /:id/patches` : `isMissionInUserScope` (M20) et mission passée en `preloaded` à
  `patches.get`, comme les autres contrôleurs.

### `packages/lib/src/roles.ts` + `api/src/controllers/program.ts`

- `canCreateOrUpdateProgram` : ajout de la liste blanche de visibilités par rôle (M26) —
  départemental : `DEPARTMENT`, `HEAD_CENTER` ; régional : + `REGION` ; administrateur : tout. Une
  visibilité vide (programmes historiques) reste couverte par le seul contrôle géographique.
- `PUT /program/:id` : double contrôle, sur le programme **stocké** (l'acteur a-t-il la main
  dessus ?) puis sur le programme **résultant** (le fait-il sortir de son périmètre ?) (H33).

## 4. Écarts assumés par rapport au plan de remédiation

- **`visibility` de mission n'est pas réservée aux administrateurs et référents.** Contrairement à
  `status` et `placesLeft`, il s'agit de l'énumération `VISIBLE` / `HIDDEN`, c'est-à-dire de la
  bascule « la mission est ouverte / fermée aux candidatures » que la structure porteuse manipule
  depuis sa propre fiche mission (`admin/src/scenes/missions/view/details.tsx:348`). La réserver
  aurait cassé un usage légitime sans fermer de vecteur : après le correctif H29, seul quelqu'un
  déjà autorisé sur la mission stockée atteint ce champ, et il peut de toute façon la retirer des
  candidatures via `status`.
- **Le périmètre géographique des référents sur les missions n'est pas introduit.** `MISSION_FULL`
  est seedée sans policy pour l'administrateur et les référents départemental et régional : ils
  écrivent sur toute mission du territoire, avant comme après ce lot. C'est une lacune de seed
  (famille H87) et non une régression, et la corriger demanderait de décider du périmètre attendu
  pour ces rôles — hors du cadre de ce lot.
- **Changement de contrat d'API :** `GET /mission/:id/application` répond désormais 404 sur une
  mission inconnue au lieu de 200 avec un tableau vide, puisque la mission doit être chargée pour
  vérifier le périmètre. Aligné sur les autres routes du contrôleur ; aucun appelant du front ne
  dépend de l'ancien comportement (tous passent l'identifiant d'une mission affichée). Le test
  correspondant de `mission.test.ts` a été scindé en deux.

## 5. Vérifications jouées

```
api  src/__tests__/mission-security.test.ts   19 passed
api  src/__tests__/program-security.test.ts    9 passed
api  src/__tests__/mission.test.ts            22 passed, 2 skipped
api  src/__tests__/program.test.ts            13 passed
api  src/__tests__/application.test.ts, application-security.test.ts,
     elasticsearch-mission-export.test.ts, structure.test.ts, referent.test.ts,
     crons/missionsJVA/                      196 passed, 1 skipped
api  src/__tests__/young.test.ts, contract.test.ts   92 passed, 2 skipped, 1 échec
lib  src/permissions, src/roles                39 passed
```

L'unique échec, `Contract › POST /contract/:id/download › should return 400 when not an ID`, repasse
au vert rejoué seul : instabilité due à la contention sur le conteneur Mongo de test partagé avec
d'autres sessions, sans rapport avec ce lot (aucune route de contrat n'est touchée).

`npm run build` (api) : succès. `npm run check-types` échoue, mais sur deux erreurs `TS6307` de
configuration préexistantes (`planDeTransport/ligneDeBus/ligneDeBusService.test.ts`,
`services/inscription-goal.test.ts`), sans rapport avec ce lot et dans des fichiers non modifiés ;
aucun fichier de ce lot n'y apparaît.

## 6. Restes à traiter

- Périmètre des référents départemental et régional sur les missions (seed `MISSION_FULL` sans
  policy) — famille H87.
- `GET /mission/:id` (`mission.ts:342`) n'est pas cloisonnée non plus : tout référent ou volontaire
  authentifié lit n'importe quelle mission, avec le nom et **l'adresse e-mail de son tuteur**
  (`mission.ts:361`). Hors du champ des entrées du lot E, mais de la même famille que H31 ; à
  instruire séparément, la route étant aussi celle du catalogue côté volontaire.
