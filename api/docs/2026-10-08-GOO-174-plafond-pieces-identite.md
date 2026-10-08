# GOO-174 — plafond de 3 pièces d'identité appliqué sur la clé de route

Date : 2026-10-08 · Base `origin/main` (`dc3949264`)

## Ce qui a été corrigé

| Où | Avant | Après |
|---|---|---|
| `api` `POST /young/:id/documents/:key`, `api/src/controllers/young/documents.js:167` | le contrôle testait `body.category === "cniFiles"` (valeur envoyée par le client : `cniNew`, `cniOld` ou `passport`, jamais égale à `"cniFiles"`) : le plafond ne s'appliquait jamais | le contrôle porte sur la clé de route `key === "cniFiles"` ; refus (403 `OPERATION_NOT_ALLOWED`) si les pièces déjà présentes plus celles de la requête courante dépassent 3 |

Pas de rétroactivité : un dossier déjà au-delà de 3 pièces garde ses pièces et ne peut simplement plus en ajouter. Aucun plafond introduit sur les autres clés (préparation militaire, droit à l'image, etc.).

## Effet visible

Un volontaire ou un référent qui a déjà 3 pièces d'identité et tente d'en ajouter une reçoit une erreur.

- `admin/src/scenes/phase0/components/CniModal.jsx:99` envoie `category` et `expirationDate` sur `/young/:id/documents/cniFiles`.
- `admin/src/scenes/phase0/components/CniModal.jsx:109-114` : sur toute réponse `!res.ok` (dont ce nouveau 403), affiche un message générique fixe (« Une erreur s'est produite lors du téléversement de votre fichier. »), sans lire `res.code` ni appeler `translate()`. Le texte affiché à l'écran sera donc le même qu'aujourd'hui pour toute autre erreur de dépôt ; aucun texte spécifique à `OPERATION_NOT_ALLOWED` n'existe sur cet écran.
- Aucun appelant côté `app/src` ne dépose de pièce sous la clé `cniFiles` (seule lecture/téléchargement : `app/src/scenes/account/scenes/general/components/IdCardReader.jsx:21`) : le dépôt de pièce d'identité n'est accessible que depuis l'admin (référent).

## Parcours de demande de correction

`api/src/controllers/correction-request.ts:78-80` vide `young.files.cniFiles` (`young.set({ "files.cniFiles": [] })`) quand une correction sur la pièce d'identité est validée. Le nouveau contrôle lit `young.files.cniFiles.length` au moment du dépôt : après un vidage, ce compteur repart de 0, donc un nouveau dépôt (jusqu'à 3 pièces) reste accepté. Aucune modification de ce fichier n'était nécessaire. Non-régression couverte par `api/src/__tests__/correction-request-security.test.ts` (déjà vert, section « POST /correction-request/:youngId — le contrôle du statut précède la suppression des pièces »).

## Carte d'impact

Appelant modifié : le handler `POST /young/:id/documents/:key` (`api/src/controllers/young/documents.js`). Appelants cités par le ticket : écrans de dépôt de pièce d'identité de l'admin (`CniModal.jsx`). Appelants non cités, dans mon périmètre de test (non modifiés, prouvés toujours fonctionnels) :

- `admin/src/scenes/phase0/components/FileField.jsx:82` (clés `imageRightFiles`, `parentConsentmentFiles` — jamais `cniFiles`).
- `app/src/scenes/militaryPreparation/components/ModalDocument.jsx:38` (clés `militaryPreparationFiles*`).

## Tests ajoutés (`api/src/__tests__/young.test.ts`, describe « plafond de 3 pièces d'identité sur la clé cniFiles (GOO-174) »)

- refus d'un 4e dépôt avec 3 pièces déjà présentes, rien d'écrit (dossier inchangé en base) ;
- refus d'un dépôt à 2 présentes + 2 envoyées (dépassement par la requête courante) ;
- acceptation exacte à 3 (2 présentes + 1 envoyée) — non-régression bornée ;
- non-plafond sur une autre clé (`militaryPreparationFilesIdentity`, 5 pièces déjà présentes + 1 envoyée, acceptée) — non-régression sur les autres clés.

La purge du fichier temporaire sur un 403 de cette route est déjà couverte, pour toute cause de 403, par `api/src/__tests__/lot-p29-fichiers-temporaires.test.ts` (« tempFileUpload : purge les fichiers quand le gestionnaire répond %i sans les supprimer », cas 403).

## Mutation (règle 13)

| Mutation (une ligne) | Résultat |
|---|---|
| `key === "cniFiles"` → `key !== "cniFiles"` | les 2 tests de refus passent au rouge (200 reçu au lieu de 403) ; les 2 autres restent verts |
| `> 3` → `>= 3` (erreur de borne) | le test « acceptation exacte à 3 » passe au rouge (403 reçu au lieu de 200) ; les 3 autres restent verts |
| `key === "cniFiles" && young.files.cniFiles.length + files.length > 3` → `young.files[key].length + files.length > 3` (plafond généralisé à toute clé) | le test « non-plafond sur une autre clé » passe au rouge (403 reçu au lieu de 200) ; les 3 autres restent verts |

Mutations annulées (`git checkout --`) avant commit.

## Vérification (Node 20, MongoDB local, suites en série)

| Suite | Résultat |
|---|---|
| `young.test.ts` | 43/45 passés (2 `skip` préexistants) |
| `young-documents.test.ts`, `young-file-path.test.ts`, `lot-p29-fichiers-temporaires.test.ts`, `correction-request-security.test.ts`, `referent-young-file-path.test.ts` | 312/316 passés (4 `skip` préexistants) |
| `npm test` (suite complète `api`) | voir PR |

## Incidents consignés pendant ce lot

[GOO-202](https://linear.app/goodpace-product/issue/GOO-202) (démon Docker indisponible dans le bac à sable) ; commentaire ajouté sur [GOO-196](https://linear.app/goodpace-product/issue/GOO-196) (contournement mongod confirmé + complément réplica set).
