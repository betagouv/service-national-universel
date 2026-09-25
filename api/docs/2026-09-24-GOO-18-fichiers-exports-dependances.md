# GOO-18 — fichiers, exports et dépendances des fronts (FM7, FM11, FM22, FL6)

Audit des fronts du 2026-09-23. Vérifié et corrigé le 2026-09-24 sur `origin/main` @ `2484ebe28`
(ticket Linear GOO-18). Code relu avant correction.

## 1. Constats et correctifs

| Id | Où | Défaut vérifié | Correctif |
| --- | --- | --- | --- |
| FM7 | admin, `ExportComponent.tsx` (`toArrayOfArray` → `aoa_to_sheet`) et tous les `json_to_sheet` | SheetJS 0.18.5 lit une cellule tableau `[valeur, formule]` comme une formule (`xlsx.js`, `sheet_add_aoa`) et recopie un objet tel quel comme cellule dans `json_to_sheet`. `department` d'un référent est un tableau : `["Ain", "HYPERLINK(…)"]` produisait une vraie formule dans l'export « Utilisateurs » (reproduit) | `toSheetCellValue` (snu-lib) ramène toute cellule à un scalaire (tableau joint, objet sérialisé) ; `safeAoaToSheet` / `safeJsonToSheet` (`admin/src/utils/file.ts`) remplacent les 15 appels directs de l'admin |
| FM7 | API, `validateReferent` (PUT `/referent/:id`) et POST `/referent/signup_invite/:template` | `department` accepté en texte libre | liste fermée `departmentList` (`referentDepartmentSchema`) ; `cleanReferentData` appliqué dès la création du compte invité, comme au PUT (un responsable invité ne garde plus `department`/`region`) |
| FM11 | admin, `MappingService.ts` (lecture du fichier d'inscription en masse) | le parcours a été supprimé par #5379 (lot O2) : plus aucun front n'appelle `XLSX.read` ni `sheet_to_*`. Les deux CVE (pollution de prototype, ReDoS) ne portent que sur la lecture | aucun code front à corriger ; montée de version reportée (§ 3) |
| FM22 | KB publique, `next.config.js` | optimiseur d'images de Next 13.5 actif (`images.domains`) alors qu'aucun composant n'utilise `next/image` | `images.unoptimized: true` : Next 13.5 répond 404 sur `/_next/image` (vérifié dans `next-server.js`) ; montée de Next reportée (§ 3) |
| FL6 | admin `CniModal.jsx`, `FileField.jsx` (via `download()`), `DownloadButton.jsx`, `RoundDownloadButton.jsx`, `ModalFilesPM.jsx`, `ModalFilesEquivalence.jsx`, `support-center/ticket/view.jsx` ; app `ModalPJ.jsx`, `engagement.repository.ts`, `echanges/View.jsx`, `young.service.ts` ; snupport-app `ChatBox.jsx` | nom de fichier du déposant réutilisé tel quel au téléchargement : un polyglotte `%PDF` accepté comme PDF et nommé `.hta`/`.html` s'enregistrait avec cette extension | `getSafeDownloadFileName(nom, mime)` (snu-lib) : base assainie, extension imposée par le type MIME ; type inconnu → extension conservée seulement si elle est dans la liste sûre, sinon `.bin`. `download()` l'applique à tous ses appelants. Les pièces du support servies en `image/*` sont typées par signature d'octets (`detectMimeTypeFromBytes`) |
| FL6 | API `young/documents.js` (upload et téléchargement), `SNUpport.ts` (upload) ; snupport-api `imap.js`, `controllers/message.js` | nom stocké et servi = nom du client ou de l'expéditeur du mail | nom reconstruit à partir du type détecté (magic numbers) à l'écriture ; recalculé aussi au téléchargement des pièces jeunes pour les fichiers déjà en base |

## 2. Choix

- Le vecteur FM7 est corrigé à la construction des cellules, pas par un préfixe `'` : une chaîne
  commençant par `=` reste une cellule texte pour SheetJS, et la préfixer altérerait les données.
- La validation `department` garde `null` et `""` : l'admin envoie `department: ""` quand le rôle change.
- snupport-app n'importe pas snu-lib : copie locale (`snupport-app/src/utils/downloadFileName.js`),
  à remplacer par le socle partagé de GOO-19.

## 3. Reportés (hors de cette PR)

- SheetJS ≥ 0.20.2 : la distribution maintenue n'est plus sur le registre npm (archive
  `cdn.sheetjs.com`) et le paquet est aussi utilisé en lecture côté serveur (import du plan de
  transport dans `api`, `File.provider` dans `apiv2`). À faire dans une PR de dépendances dédiée,
  avec régénération du lockfile et tests des imports.
- Next.js 13.5 → version supportée pour la KB publique : montée majeure (React 19 pour Next 15),
  à faire séparément.
- axios ≥ 1.18, @sentry/react ≥ 8.33, sanitize-html ≥ 2.17.6 : même PR de dépendances.

## 4. À faire en production

- Rien d'obligatoire. Les pièces déjà stockées gardent leur nom d'origine en base ; il est recalculé
  au téléchargement pour les pièces des jeunes, et par les fronts pour les autres.

## 5. Tests

- `packages/lib/src/utils/file.spec.ts` : `getSafeDownloadFileName`, `detectMimeTypeFromBytes`, `toSheetCellValue`.
- `api/src/__tests__/referent-security.test.ts` (FM7) : département hors liste refusé au PUT et à
  l'invitation, département valide accepté, champs de périmètre retirés à l'invitation.
- `snupport-api/src/__tests__/attachmentFileName.test.js`, `snupport-app/src/utils/__tests__/downloadFileName.test.js`.
