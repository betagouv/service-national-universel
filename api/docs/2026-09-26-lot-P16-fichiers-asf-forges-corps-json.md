# Lot P16 — fichiers ASF forgés qui figent file-type et corps JSON de 10 Mo

Audit de sécurité de la production du 25/09/2026, constats PH24, PM33 et PL21 (ticket Linear
GOO-64). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main`.

Le brouillon initial du lot P16 (audit) regroupait aussi PM50/PM51 (relève IMAP résiliente) et
PM49 (antivirus des pièces jointes support) : ces deux volets sont traités séparément par les
lots P30 (GOO-78) et P31 (GOO-83), non touchés ici.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PH24 | élevée | Entrée IMAP (`imap.js`), `POST /message/sendEmailFile/:id`, `POST /message/s3file/publicUrl` | `inspectAttachment` (snupport-api) refuse tout buffer dont les 10 premiers octets portent la signature `ASF_Header_Object`, avant tout appel à `FileType.fromBuffer` |
| PM33 | moyenne | `POST /SNUpport/upload`, `POST /young/:id/documents/:key` et les autres dépôts passant par `getMimeFromFile`/`getMimeFromBuffer` (api v1) | même garde dans `api/src/utils/file.ts`, appliqué aux deux fonctions avant tout appel à `FileType.fromFile`/`fromBuffer` |
| PL21 | faible | Toute route de `snupport-api`, y compris les routes inexistantes ou non authentifiées | limite du corps JSON ramenée de 10 Mo à 1 Mo (`express.json({ limit: "1mb" })`) ; suppression de `app.use(bodyParser.json())`, mort car monté après `express.json()` qui a déjà consommé le corps |

## 2. Choix

- **Point de correction unique** : la signature ASF (`30 26 B2 75 8E 66 CF 11 A6 D9`) est détectée
  par une seule fonction exportée par `snu-lib` (`hasAsfSignature`, `packages/lib/src/utils/file.ts`),
  appelée depuis `snupport-api/src/utils/attachments.js` (`inspectAttachment`) et
  `api/src/utils/file.ts` (`getMimeFromFile`, `getMimeFromBuffer`). Aucun des 8 points d'appel de
  ces deux fonctions dans l'api v1 (`SNUpport.ts`, `documents.js`, `young/index.ts`,
  `applicationController.ts` ×2, `referentController.ts` ×3, `equivalenceController.ts`) n'a été
  modifié : le refus est transparent pour les appelants (un fichier ASF est simplement traité
  comme un contenu non identifiable, `mime: null`).
- **`snupport-api` dépend désormais de `snu-lib`** (`"snu-lib": "*"` ajouté à
  `snupport-api/package.json` et à son entrée dans `package-lock.json`) : c'était jusqu'ici la
  seule app back sans cette dépendance (`safeUrl.js` en gardait une copie conforme plutôt que
  d'importer snu-lib). Vérifié que le packaging de déploiement (`devops/build/build.sh`,
  `build-all.sh`, `Dockerfile.back`, via `devops/build/copy-packages.sh`) recopie déjà
  génériquement tout `packages/*` présent dans `out/packages/` après `turbo prune` — donc tout
  paquet workspace déclaré en dépendance est embarqué sans changement de script. `turbo prune
  snupport-api` inclut désormais `packages/lib` dans le graphe grâce à cette déclaration.
- **`getMimeFromFile`** (api v1) lit seulement les 10 premiers octets du fichier temporaire
  (`fs.promises.open` + `read`) avant de décider, plutôt que de charger tout le fichier en mémoire.
- **Pas de timeout applicatif retenu** (approche écartée, confirmée par relecture de
  `node_modules/file-type/core.js` et reproduction locale) : la boucle de décodage de l'objet ASF
  (`strtok3`) n'enchaîne que des promesses déjà résolues et ne laisse jamais passer la timer phase
  — `Promise.race` avec un `setTimeout` ne rend pas la main. Reproduit en environnement de test :
  un appel direct à `FileType.fromBuffer` sur un buffer portant la signature ASF fige le process
  Node **au-delà de 120 s**, largement au-delà de tout `jest.setTimeout` raisonnable. Les tests de
  non-régression (`attachments.test.js`, `file.test.ts`) mockent donc `FileType.fromBuffer`/`fromFile`
  pour ce cas précis et vérifient que le garde-fou intercepte **avant** tout appel à la
  bibliothèque, plutôt que de chronométrer un appel réel — la bibliothèque vulnérable n'est jamais
  exercée dans la suite de tests.
- **PL21** : extraction d'`applyJsonBodyParser`/`BODY_SIZE_LIMIT` dans un nouveau
  `snupport-api/src/middlewares/httpHardening.js` (calqué sur `api/src/middlewares/httpHardening.ts`),
  pour permettre un test isolé sans démarrer `index.ts` (qui se connecte à Mongo, IMAP et les
  crons dès son import). Limite alignée sur celle de l'api v1 (1 Mo) : aucune route JSON de
  `snupport-api` ne s'en approche, les pièces jointes passant par le parseur multipart dédié
  (`middlewares/attachmentUpload.js`).
- **Portée non fermée** : le garde ferme le seul format reproduit par l'audit (ASF/WMA/WMV,
  aucun des trois n'étant accepté nulle part dans ce dépôt). Il ne garantit pas qu'aucune autre
  entrée ne fait boucler `file-type` 16.5.4 — aucun autre format n'a été testé. La montée de
  version de `file-type` reste à planifier séparément.

## 3. Impact fonctionnel

Très faible : aucun format ASF, WMA ou WMV n'est accepté par une liste blanche existante
(`ALLOWED_MIME_TYPES` de `snupport-api`, listes de mime des routes de dépôt de l'api v1) —
le garde ne fait que refuser plus tôt un contenu déjà rejeté en aval. Aucune route JSON connue de
`snupport-api` ne dépasse 1 Mo.

## 4. Tâches post-déploiement

- Déploiement : rebuild de `snu-lib`, puis `api` et `snupport-api` (sans ordre entre elles).
- Aucune donnée à purger, aucune migration.
- À planifier séparément (hors lot) : montée de version de `file-type`/`strtok3` (aucun correctif
  amont connu à ce jour pour la boucle ASF) et, si retenue, extension du garde à d'autres formats
  container non reproduits par l'audit.
- Constat en passant, hors périmètre de ce lot : `snupport-api` (461 tests) n'est couvert par
  **aucun job CI** (`.github/workflows/run-tests.yml` ne matrice que `api`, `apiv2`, `app`,
  `admin`, `lib`) — les tests de ce lot, comme tous ceux de cette app, ne sont vérifiés que
  localement.
