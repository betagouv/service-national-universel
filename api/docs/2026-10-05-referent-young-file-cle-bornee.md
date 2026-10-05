# Lot : clé et nom de fichier bornés sur les téléchargements de pièces

Date : 2026-10-05 · Constats PH20 et H65 (reprise après la vérification des correctifs du 05/10/2026) ·
Branche `fix/referent-young-file-cle-bornee`, base `origin/main` (`b46218e79`)

Déploiement : api seul. Aucun contrat de front modifié : le seul écran qui appelle
`GET /referent/youngFile/:youngId/:key/:fileName` envoie la clé `equivalenceFiles` et un nom produit à l'envoi du
fichier (`<nom-slugifié>-<n>.<extension>`). Aucune migration.

## Ce qui est corrigé

### Invariant rétabli

Le chemin d'objet d'une pièce (`app/young/<id>/<clé>/<nom>`) est assemblé à partir de deux valeurs de l'URL. Chacune
doit désigner **un seul niveau** de l'arborescence, et la clé doit être l'une des pièces connues. Les contrôles
d'accès par clé (`canAccessYoungFileKeyInScope`) ne s'appliquent qu'à une clé qu'ils reconnaissent : la clé est donc
bornée **avant** la recherche du volontaire et avant le contrôle de périmètre.

Une fonction unique, `isSafePathSegment` / `safePathSegment()` (`src/utils/pathSegment.ts`), porte cette règle. Elle
s'applique à la valeur décodée de `req.params` et refuse :

- la chaîne vide, les segments `.` et `..` ;
- tout `/` et tout `\` ;
- tout caractère de contrôle (C0, DEL, C1, donc l'octet nul).

Une suite de points à l'intérieur d'un nom (`a..b.pdf`) reste valide, de même que les espaces et les accents : seuls
les noms que le stockage interpréterait comme un chemin sont refusés.

### Routes concernées

| Route | Avant | Maintenant |
| --- | --- | --- |
| `GET /referent/youngFile/:youngId/:key/:fileName` | `key` et `fileName` : `Joi.string()` | `key` ∈ `FILE_KEYS` + `MILITARY_FILE_KEYS`, `fileName` : un niveau |
| `GET /referent/youngFile/:youngId/military-preparation/:key/:fileName` | idem | `key` ∈ `MILITARY_FILE_KEYS`, `fileName` : un niveau |
| `POST /referent/file/:key` | `key` libre (chemin d'écriture et nom du champ du dossier mis à jour) | `key` ∈ `FILE_KEYS` + `MILITARY_FILE_KEYS` |
| `GET /young/file/:youngId/:key/:fileName` | `key` et `fileName` libres | mêmes règles que la première route |
| `GET /young/:id/phase2/equivalence/file/:name` | `name` libre | `name` : un niveau |
| `GET /SNUpport/s3file/:id` | motif local (`/^[^/\\]+$/`) | même fonction partagée (le contrôle d'appartenance de la pièce reste en aval) |

Les clés acceptées sont celles de `/young/:id/documents/:key` (`FILE_KEYS` + `MILITARY_FILE_KEYS`). Les pièces de
préparation militaire restent acceptées sur la route générique : des pièces déposées avant le rangement sous
`military-preparation/` sont encore lues à leur ancien emplacement, comme le fait déjà `documents.js`. Leur contrôle
de périmètre (PH20) est inchangé.

Un refus de validation répond 400 sans appeler le stockage, quel que soit l'acteur (y compris hors périmètre ou sur un
volontaire inexistant).

## Comportements modifiés

- Une clé qui n'est pas une pièce connue répond 400 au lieu de 200 ou 500 (l'objet n'existait pas). Seule
  `equivalenceFiles` est demandée par un front.
- Un nom ou une clé contenant un séparateur, une remontée ou un caractère de contrôle répond 400.

## Non traité ici

- Les dépôts (`POST /referent/file/:key`, `POST /young/file/:key`, `POST /application/:id/file/:key`) reprennent le
  nom du fichier envoyé. La bibliothèque de téléversement (express-fileupload, busboy 1.6) n'en conserve que le
  dernier niveau (vérifié sur les options des routes : `../a/b.pdf` devient `b.pdf`, un nom réduit à `..` reçoit un
  nom généré) ; ce garde-fou n'est pas dupliqué ici.

## Tests

`src/__tests__/path-segment.test.ts` (fonction partagée), `referent-young-file-path.test.ts` (routes référent),
`young-file-path.test.ts` (routes volontaire et équivalences), un cas ajouté dans `snupport.test.ts`. Le test de
`referent.test.ts` qui utilisait une clé fictive (`key`) utilise désormais `equivalenceFiles`.
