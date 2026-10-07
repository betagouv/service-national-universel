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

## Déploiement

Le flag par défaut (`false`) rend cette PR, fusionnée seule, sans effet en production. L'activation
du format authentifié est une décision séparée de l'opérateur, après déploiement.

## Suites de test

- `api/src/__tests__/cryptoUtils.test.ts` : round-trip des deux formats, détection d'altération GCM,
  lecture rétrocompatible, garde sur le secret support.
- `api/src/__tests__/cryptoUtils-snupport-roundtrip.test.ts` : round-trip réel sur la vraie route
  `POST /SNUpport/upload` → `GET /SNUpport/s3file/:id`, sans mocker le chiffrement.

## Reste ouvert

Gap de couverture pré-existant (6 des 8 appelants de `cryptoUtils` dans `api/src` ne sont exercés,
dans la suite de test, qu'à travers un mock de `cryptoUtils` — consigné sur GOO-192, Production -
incidents, hors périmètre de ce ticket).
