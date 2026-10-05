# Montée de `file-type` 16.5.4 → 21.3.4 (suite du lot P16)

Le lot P16 (PH24, PM33 — voir `2026-09-26-lot-P16-fichiers-asf-forges-corps-json.md`) refusait un
fichier ASF forgé par sa signature, avant d'appeler `file-type`. Cette garde n'écartait que la forme
directe du fichier : une même charge précédée d'un préfixe de métadonnées audio contournait le
refus, et la détection de `file-type` 16.5.4 ne terminait plus. Le correctif amont existe depuis
`file-type` 21.3.1 (avis GHSA-5v7r-6r5c-r473) : c'est lui qui est appliqué ici, la garde par
signature restant en défense en profondeur.

## 1. Correctif

| Surface | Correctif |
| --- | --- |
| Entrée IMAP et réponses de ticket de `snupport-api` (`inspectAttachment`) | `file-type` ^21.3.4 |
| Dépôts de fichiers de l'api v1 (`getMimeFromFile`, `getMimeFromBuffer`) | `file-type` ^21.3.4 |

21.3.4 est la dernière version de la lignée 21 : la 22 exige Node ≥ 22, alors que les moteurs du
dépôt sont `^20.17`. Vérifié sous Node 20.17.0 et 20.20.2.

## 2. Choix

- **`file-type` ≥ 17 est ESM-only**, et `api` et `snupport-api` sont en CommonJS : la bibliothèque
  se charge par `import()` dynamique (`snupport-api/src/utils/loadFileType.js`,
  `api/src/utils/loadFileType.js`). Les appelants ne changent pas.
- **Un module de chargement à part, remplacé sous jest** (`api/src/utils/loadFileType.js`,
  `snupport-api/src/utils/loadFileType.js`, substitués par `src/__tests__/helpers/loadFileType.js`
  via `moduleNameMapper`). Le module reste en JavaScript : `ts-jest` réécrirait un `import()` écrit
  dans un `.ts` en `require()`, que jest ne sait pas résoudre sur un paquet ESM-only. En test, le
  remplaçant compile l'`import()` dans le contexte principal de Node
  (`vm.constants.USE_MAIN_CONTEXT_DEFAULT_LOADER`, Node ≥ 20.12) : `file-type` n'est chargé qu'une
  fois par processus, hors des contextes jest.
- **Approches écartées** : `new Function` (jest réutilise le callback d'import d'une suite déjà
  démontée, « Test environment has been torn down », de façon intermittente) et
  `--experimental-vm-modules` : avec ce drapeau, `test (api)` a fini en OOM en CI (heap 3,8 Go sur
  4 Go à la 35e suite, code 134). Sans lui, la suite complète (121 suites) passe en local avec un
  pic de 3,7 Go, et 3,05 Go à la 35e suite : l'écart (~0,7 Go) est un indice fort, pas une preuve
  (machines différentes). Le drapeau écrasait aussi le `NODE_OPTIONS=--max-old-space-size=4096` de la
  CI. **Attention** : la suite api reste proche du plafond de 4 Go, avec ou sans ce changement.
- **Pas de régression de détection** : comparaison 16.5.4 / 21.3.4 sur de vrais fichiers de chaque
  type de la liste blanche (PDF, PNG, JPEG, GIF, HEIC, HEIF, WebP, DOCX, XLSX, PPTX, ODT, ODS, ODP) :
  types identiques. La 21.x est plus stricte sur les fichiers fabriqués à la main (un PNG réduit à sa
  signature, un DOCX dont le type de contenu n'est pas celui que Word écrit) : les fixtures de
  `attachments.test.js` ont été remplacées par des fichiers conformes.
- **Test de non-régression de version** : `file.test.ts` et `attachments.test.js` lancent la vraie
  bibliothèque sur l'ASF forgé, direct et derrière un préfixe, dans un processus enfant tué au bout
  de 15 s. Un retour à une version vulnérable fait échouer le test au lieu de bloquer la suite.
- `controllers/young/index.ts` n'importe plus le type `FileTypeResult` (`string | null` suffit).

## 3. Hors périmètre

`apiv2` n'appelle pas `file-type` : seul `@nestjs/common` 11.1.3 en embarque une copie 21.0.0, qui
n'est chargée que par `FileTypeValidator`, que `apiv2` n'utilise pas (uniquement `FileInterceptor`).
À revoir si ce validateur y est un jour adopté.

## 4. Tâches post-déploiement

- Déploiement : `api` et `snupport-api` (sans ordre entre elles). Aucune donnée, aucune migration.
- Surveiller au premier redémarrage que l'import dynamique de `file-type` fonctionne sur le runtime de
  production (`engines` : Node ^20.17).
