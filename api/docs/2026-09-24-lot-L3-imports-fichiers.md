# Lot L3 — Imports de fichiers : PDT, PDR, plan marketing, CSV CLE (M63, L5, L16, L32, L33)

Date : 2026-09-24 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-35 · Branche `fix/lot-l3-imports-fichiers`, base `origin/main` (`b6a609990`)

## État des constats sur `origin/main`

| Id | État avant ce lot |
|---|---|
| M63 | **Déjà fermé** pour la route : `api/src/controllers/planDeTransport/import.ts` a été supprimé par #5312 avec l'écran d'import de l'admin. Le service `pdtImportService.ts`, qui porte la validation défaillante (classes et PDR non rapprochés de la cohorte), restait dans le dépôt sans appelant. |
| L16 | **Déjà fermé** : la transaction fautive vivait dans la route supprimée par #5312. |
| L5 | **Déjà fermé** : `PUT /cle/classes/update-referents-by-csv` n'est plus montée (`cle-routes-supprimees.test.ts`). |
| L32 | Ouvert. |
| L33 | Ouvert. |

## Ce qui change

| Id | Avant | Après |
|---|---|---|
| M63, L16 | service d'import PDT orphelin, réutilisable tel quel | `pdtImportService.ts` supprimé. `pdtImportUtils.ts` est conservé : une migration l'utilise. |
| L32 | `POST /plan-marketing/import` : clé S3 = `plan-marketing/<nom du fichier client>`, type = MIME déclaré, pas d'antivirus, upload non attendu, fichier temporaire jamais supprimé, `error.message` renvoyé | clé générée côté serveur (`plan-marketing/<horodatage>-<uuid>.csv`) et renvoyée dans `data` ; contenu vérifié (aucune signature binaire, pas d'octet nul) ; `scanFile` ; upload attendu ; fichier temporaire supprimé en `finally` ; seul un code d'erreur est renvoyé |
| L33 | `POST /point-de-rassemblement/import` : mêmes défauts, avec une clé `file/point-de-rassemblement/<nom du fichier client>` | clé générée côté serveur ; signature XLSX vérifiée ; `scanFile` ; uploads attendus ; fichier temporaire supprimé ; seul un code d'erreur est renvoyé. Exception : le message « colonnes manquantes » est conservé, car il ne contient que les noms des colonnes attendues et sert à l'utilisateur. |

- `api/src/utils/importedFile.ts` (nouveau) : `buildImportedFileKey`, `assertImportedFile` (lève
  `UNSUPPORTED_TYPE` ou `FILE_INFECTED`), `removeTempFile`. Ce module est réutilisable par les
  autres imports.
- Import PDR : le flux CSV du rapport était lu deux fois (une fois pour l'upload, une fois pour la
  pièce jointe). Il est maintenant matérialisé une seule fois en buffer.
- Admin (`useBrevoExport`, `brevoRecipientsService`) : la liste de diffusion est créée avec le
  chemin renvoyé par l'API, qui respecte `PLAN_MARKETING_PATH_FILE_REGEX` côté apiv2. Si l'API ne
  renvoie pas de chemin (version antérieure à ce lot), l'admin reprend l'ancien chemin.

## Démonstration

`api/src/__tests__/lot-l3-imports-fichiers.test.ts` (14 cas, 6 en échec sans le correctif) :

- un nom de fichier `../../file/young/x.csv` ou `../x.xlsx` donne une clé propre, conforme à la regex d'apiv2 ;
- un PNG déclaré `text/csv` ou un CSV déclaré XLSX → 422 `UNSUPPORTED_TYPE`, aucun upload ;
- l'antivirus signale le fichier → `FILE_INFECTED` ;
- une erreur Mongo pendant l'import PDR → 422 `FILE_CORRUPTED`, sans message ;
- aucun fichier temporaire d'express-fileupload ne reste dans `/tmp` après la requête ;
- aucune route d'import de plan de transport n'est montée.

`pdtImportUtils.test.ts` et `cle-routes-supprimees.test.ts` restent verts. `tsc` passe sur api et admin.

## Actions de déploiement

Déployer l'**admin avant l'API**, ou les deux ensemble. Un admin à jour face à l'ancienne API se
rabat sur l'ancien chemin et fonctionne. À l'inverse, un admin qui n'a pas été redéployé envoie à
apiv2 `plan-marketing/<nom local>`, un fichier que la nouvelle API ne crée plus : la création de
la liste de diffusion échoue.
