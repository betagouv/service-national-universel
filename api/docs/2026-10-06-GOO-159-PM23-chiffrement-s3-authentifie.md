# GOO-159 — PM23 : chiffrement S3 authentifié, format versionné

`api/src/cryptoUtils.ts` (`encrypt`/`decrypt`, utilisées pour les pièces jointes stockées sur S3)
chiffrait en AES-256-CTR sans authentification (pas de code d'intégrité) : un objet S3 altéré se
déchiffrait silencieusement en données corrompues.

## Correctif

- Nouveau format versionné AES-256-GCM (authentifié), écrit derrière le flag
  `ENABLE_FILE_ENCRYPTION_V1` (défaut `false`).
- `decrypt` lit toujours les deux formats (choix par les octets lus, pas par le flag) : aucune
  migration des objets existants n'est nécessaire, et un rollback du flag ne casse rien.
- Les pièces jointes du support (`FILE_ENCRYPTION_SECRET_SUPPORT`) restent écrites en CTR même flag
  actif : `snupport-api`, qui partage le même bucket/préfixe, ne sait lire que ce format.
- Coupe-circuit `ENABLE_FILE_ENCRYPTION_LEGACY_READ` (défaut `true`) : tant qu'il reste actif, un
  objet non versionné — y compris un objet V1 dont l'en-tête a été retiré ou remplacé par une
  altération complète de l'objet S3 — se déchiffre encore sans authentification. Le désactiver
  (après avoir rechiffré tous les objets existants, hors périmètre de cette PR) ferme ce résidu en
  refusant toute lecture non versionnée.

## Carte d'impact

9 points d'appel d'`encrypt`/`decrypt` dans `api/src` (tous via les deux mêmes fonctions exportées,
aucun changement de signature) : `session-phase1.ts`, `young/index.ts`, `young/documents.js`,
`equivalence/equivalenceController.ts`, `application/applicationController.ts`, `SNUpport.ts` (seul
secret explicite), `referent/referentController.ts` (×2 lectures + 1 écriture), `cohort/
cohortController.ts` (×2, exports DSNJ/INJEP sans écrivain dans ce dépôt).

## Déploiement

Le flag par défaut (`false`) rend cette PR, fusionnée seule, sans effet en production. L'activation
du format authentifié est une décision séparée de l'opérateur, après déploiement.

## Effet visible

En nominal, aucun changement : les routes renvoient toujours `{ data: Buffer, mimeType, fileName,
ok }`. Une fois `ENABLE_FILE_ENCRYPTION_V1` actif, un objet V1 altéré (en-tête conservé) fait
désormais lever `decrypt` : la route répond `500 SERVER_ERROR` au lieu de renvoyer un fichier
corrompu silencieusement — c'est l'effet recherché par ce correctif.

## Suites de test

- `api/src/__tests__/cryptoUtils.test.ts` : round-trip des deux formats, détection d'altération GCM,
  lecture rétrocompatible, garde sur le secret support, coupe-circuit de lecture legacy.
- `api/src/__tests__/cryptoUtils-snupport-roundtrip.test.ts` : round-trip réel sur la vraie route
  `POST /SNUpport/upload` → `GET /SNUpport/s3file/:id`, sans mocker le chiffrement.

## Reste ouvert

- Gap de couverture pré-existant : 8 des 9 appelants de `cryptoUtils` dans `api/src` ne sont exercés,
  dans la suite de test, qu'à travers un mock de `cryptoUtils` — consigné sur GOO-192, Production -
  incidents, hors périmètre de ce ticket.
- Tant que `ENABLE_FILE_ENCRYPTION_LEGACY_READ` reste actif (défaut), la lecture rétrocompatible
  n'est pas authentifiée pour un objet dont l'en-tête versionné a été retiré ou remplacé : la
  fermeture complète du constat suppose un rechiffrement de tous les objets existants puis la
  désactivation de ce flag — hors périmètre de cette PR.
