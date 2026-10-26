# H65 / H66 — Téléchargement des pièces d'un volontaire sans périmètre (`api/src/referent/referentController.ts`)

Audit du 2026-09-21, findings H65 et H66. Sévérité **high**. Statut après ce lot : **corrigés**.

Vérifié sur `origin/main` au 2026-09-22 (`6de84af33`, après les lots H63/H64/H67 et H69/H68/M68) : les deux
routes y sont toujours dans leur état d'origine. Le constat de l'audit portait bien sur du code en production
et n'a pas été traité par les lots intermédiaires.

## H65 — `GET /referent/youngFile/:youngId/:key/:fileName`

### Ce que disait l'audit

Pour `responsible` et `supervisor`, la route chargeait les structures de l'acteur et appelait
`canViewYoungFile(acteur, jeune, saPropreStructure)`. La condition retenue est
`actor.region === targetCenter.region`, qui ne fait jamais intervenir le jeune. La vraie vérification
(candidature du jeune dans la structure) était restée en commentaire.

### Vérifié

Exact. `canViewYoungFile` (`packages/lib/src/roles.ts:416`) n'a que cinq branches :

| Branche | Valeur pour un `responsible` |
|---|---|
| `isAdmin` | `false` |
| `isReferentDepartmentFromTargetDepartment` | `false` (garde sur le rôle) |
| `isReferentRegionFromTargetRegion` | `false` (garde sur le rôle) |
| `actor.department === targetCenter?.department` | `string[] === string` → `false`… **sauf `undefined === undefined`** |
| `actor.region === targetCenter?.region` | **`true`** dès que le compte porte la région de sa propre structure |

Le `targetCenter` passé par le contrôleur est **la structure de l'acteur lui‑même**, pas un centre lié au
volontaire. Les deux dernières branches ne comparent donc que l'acteur à lui‑même.

**Deux vecteurs, pas un seul.** L'audit ne retient que le premier :

1. *Comptes historiques* — `region` encore renseignée et égale à celle de la structure → la 5ᵉ branche
   passe. C'est le cas décrit par l'audit.
2. *Comptes nettoyés* — `cleanReferentData` (`referentController.ts:177`) ne conserve que `structureId`
   pour `responsible` / `supervisor` et met `region` et `department` à `undefined`. Si la structure n'a
   **ni** `region` **ni** `department` (les deux champs sont optionnels, `packages/lib/src/mongoSchema/structure.ts:192`
   et `:199`), on retombe sur `undefined === undefined` → la 4ᵉ **et** la 5ᵉ branche passent.

Autrement dit, `cleanReferentData` n'est pas l'atténuation supposée : sur une structure sans géographie,
il rend la route exploitable au lieu de la fermer.

## H66 — `GET /referent/youngFile/:youngId/military-preparation/:key/:fileName`

### Ce que disait l'audit

Si `canViewYoungMilitaryPreparationFile` échoue, le seul filet était
`structure.isMilitaryPreparation === "true"` sur la structure de l'acteur, sans aucun lien avec le jeune.

### Vérifié

Exact, avec deux écarts par rapport au libellé de l'audit :

- le refus renvoyait **400** et non 403 (`ERRORS.OPERATION_UNAUTHORIZED` sur un statut `400`) ;
- `YoungModel.findById` n'était **pas** suivi d'un contrôle d'existence : sur un `youngId` inexistant la
  route poursuivait jusqu'à `getFile()` au lieu de renvoyer 404.

## Reproduction

Test `api/src/__tests__/referent-young-file-security.test.ts`. Sur le code d'origine, 6 des 12 cas
échouaient :

```
✕ H65 · responsable dont le compte porte la région de sa structure   attendu 403, reçu 200
✕ H65 · responsable au compte nettoyé, structure sans géographie     attendu 403, reçu 200
✕ H65 · superviseur hors périmètre                                   attendu 403, reçu 200
✕ H66 · responsable de structure PM, volontaire hors périmètre       attendu 403, reçu 200
✕ H66 · responsable de structure NON PM                              attendu 403, reçu 400
✕ H66 · volontaire inexistant                                        attendu 404, reçu 200
```

Les trois cas légitimes (candidature dans la structure, candidature dans le réseau d'un superviseur,
candidature dans la structure PM) renvoyaient déjà 200 et le sont restés : la correction ne retire aucun
accès métier.

## Correction

### 1. Périmètre réel (`api/src/young/youngScope.ts`)

`isYoungInStructureScope` existait déjà, posé lors de la correction de C15. Extraction de
`getActorStructureIds` (structure propre, plus le réseau pour un superviseur — même découpage que les
policies `structureId` / `networkId`) et ajout de `isYoungInMilitaryPreparationStructureScope`, qui exige
une candidature du volontaire **dans une structure de préparation militaire du périmètre de l'acteur**.

### 2. Les deux routes (`api/src/referent/referentController.ts`)

- H65 : la boucle sur les structures et le `reduce` sur `canViewYoungFile` sont remplacés par
  `isYoungInStructureScope` — exactement le contrôle laissé en commentaire depuis l'origine.
- H66 : ajout du 404 sur volontaire inexistant, remplacement du repli `isMilitaryPreparation` par
  `isYoungInMilitaryPreparationStructureScope`, et refus en 403 au lieu de 400.

### 3. Racine partagée (`packages/lib/src/roles.ts`)

Les branches `targetCenter` de `canViewYoungFile` exigent désormais une valeur des deux côtés
(`!!targetCenter?.region && …`). Sans cela, `undefined === undefined` restait exploitable sur les
**deux autres** appels du prédicat, qui ne passent aucun `targetCenter` et ne filtrent aucun rôle :

- `POST /referent/file/:key` (dépôt de pièces, `referentController.ts:1408`) ;
- `PUT /referent/young/:id/removeMilitaryFile/:key` (suppression de pièces, `referentController.ts:2009`).

Vérifié par test : avant durcissement, un `responsible` au compte nettoyé obtenait **200** sur ces deux
routes pour un volontaire quelconque — soit de l'**écriture**, pas seulement de la lecture. Ce point n'est
pas dans l'audit.

Impact du durcissement sur les appelants légitimes : nul. `canViewYoungFile` n'est utilisé que dans
`referentController.ts` (jamais dans le front). Les branches de rôle (admin, référent départemental /
régional) sont inchangées, et l'UI équivalence — seul appelant de `POST /referent/file/:key` — est réservée
à `REFERENT_REGION` / `REFERENT_DEPARTMENT` (`admin/src/scenes/volontaires/components/Equivalence.jsx:87`).
`removeMilitaryFile` n'a aucun appelant front.

## Surface d'appel

- `GET /referent/youngFile/:youngId/:key/:fileName` : un seul appelant front,
  `admin/src/scenes/volontaires/components/ModalFilesEquivalence.jsx:69` (pièces d'équivalence).
- `GET /referent/youngFile/:youngId/military-preparation/…` : **aucun appelant front**. L'admin télécharge
  les pièces PM via `/young/:id/documents/:key`, déjà passé sous `canAccessYoungDocumentsInScope`. Cette
  route est de la surface héritée, à supprimer dans un lot ultérieur.

## Vérification

Sur `origin/main` `6de84af33` :

```
referent-young-file-security.test.ts                                   12 / 12
referent, referent-security, referent-young-security, young-security,
young-documents, application, application-security                     222 passés, 3 ignorés
tsc --noEmit -p tsconfig.build.json                                    0 erreur
```

Note d'environnement : le dépôt exige Node `^20.17` (`api/package.json:7`) ; la suite ne démarre pas sous
Node ≥ 22 (`buffer-equal-constant-time` utilise `SlowBuffer`, retiré depuis). Les exécutions ci‑dessus ont
été faites avec `/opt/homebrew/opt/node@20/bin`. `packages/lib` étant consommé via `dist/`, un
`npm run build` dans `packages/lib` est nécessaire pour que le changement de `roles.ts` soit visible des
tests API.

## Restes à traiter

- `canViewYoungFile` demeure une matrice **géographique** : elle n'exprime aucun rattachement acteur ↔
  volontaire. Les deux routes d'écriture ci‑dessus s'appuient encore sur elle seule, sans garde de rôle.
  Le durcissement ferme le contournement `undefined`, il ne remplace pas un contrôle de périmètre.
- Les deux routes `youngFile` dupliquent `/young/:id/documents/:key`, qui porte déjà le bon contrôle. Le
  `// Todo: refactor` du fichier reste d'actualité.
- La suite de tests API émet de vrais appels sortants vers Brevo (rejetés par filtrage d'IP). Hors sujet
  ici, mais à isoler.
