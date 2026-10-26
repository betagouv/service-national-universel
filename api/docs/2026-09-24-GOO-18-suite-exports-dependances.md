# GOO-18 (suite) : exports serveur et montées de dépendances (FM7, FM11)

Suite de #5387. Vérifié et corrigé le 2026-09-24 sur `origin/main` @ `d9d637442`
(ticket Linear GOO-18). Code relu avant correction.

## 1. Constats et correctifs

| Id | Où | Défaut vérifié | Correctif |
| --- | --- | --- | --- |
| FM7 | apiv2, `FileProvider.generateExcel` / `generateExcelFromValues` (`shared/infra/File.provider.ts`) | même vecteur que l'admin, côté serveur. Un objet passé à `json_to_sheet` est recopié tel quel comme cellule (`{ f: "…" }` devient une formule). Un tableau `[valeur, formule]` passé à `aoa_to_sheet` produit lui aussi une formule. Ces deux méthodes écrivent les rapports d'import, d'affectation et de bascule, et les exports de missions et de candidatures. Reproduit par test : une formule est écrite sans le correctif | toute cellule passe par `toSheetCellValue` (snu-lib) avant SheetJS |
| FM7 | snupport-app, `knowledgeBaseSearch.jsx` (export des recherches de la KB) | dernier `json_to_sheet` direct d'un front. `search` est un `String` mongoose, donc le vecteur n'est pas exploitable aujourd'hui : c'est une défense en profondeur | `safeJsonToSheet`, copie locale dans `snupport-app/src/utils/sheet.js` (snupport-app n'importe pas snu-lib ; à remplacer par GOO-19) |
| FM11 | `xlsx` 0.18.5 dans admin, api, apiv2, snupport-api et snupport-app | CVE-2023-30533 (pollution de prototype) et CVE-2024-22363 (ReDoS) à la **lecture** d'un fichier. L'api et l'apiv2 lisent des fichiers téléversés (plan de transport, imports de référentiels) | `xlsx` 0.20.3, distribution officielle `cdn.sheetjs.com` (la 0.20.x n'est plus publiée sur npm) |
| FM11 | admin `axios` 1.12.0 | une trentaine d'avis `npm audit`, dont des gadgets de pollution de prototype (corrigés en 1.18.0) | `axios` 1.20.0 (version exacte, comme avant). Avec les typages d'axios 1.20, `post<T, T>` renvoie un type conditionnel : `admin/src/services/apiv2.ts` le reconvertit en `Promise<T>`. L'intercepteur renvoie déjà `response.data` |
| FM11 | admin et app `@sentry/react` 8.25 | gadget de pollution de prototype (< 8.33) | `^8.55.2` (même majeure) |

## 2. Non fait

- **sanitize-html** : les deux avis ouverts (XSS via SVG SMIL, mutation-XSS `</textarea/>`) ne sont
  corrigés qu'en 2.17.7. Cette version exige Node ≥ 22.12, car htmlparser2 12 n'est publié qu'en ESM.
  Sous Node 20, `require("sanitize-html")` échoue (vérifié). La 2.17.5, dernière version compatible,
  reste vulnérable. La montée attend donc la migration Node 22 du dépôt. Aucune des listes blanches
  du dépôt n'autorise `svg`, `animate` ni `textarea` ; l'exposition réelle au second avis n'a pas
  été vérifiée.
- **snupport-app `@sentry/react` 7.x** : passer en 8 est une montée majeure, à traiter à part.
- **Next.js 13.5 de la KB (FM22)** : montée majeure (Next 15 et React 19), toujours reportée.

## 3. À faire en production

- Rien. Le build (`npm ci`) doit pouvoir joindre `cdn.sheetjs.com` : l'archive `xlsx` en vient,
  avec son empreinte d'intégrité dans le lockfile.

## 4. Tests

- `apiv2/src/shared/infra/File.provider.spec.ts` : aucune formule écrite depuis un objet ou un
  tableau (le test échoue sans le correctif).
- `snupport-app/src/utils/__tests__/sheet.test.js`.
- Avec xlsx 0.20.3 : 25 suites apiv2 qui touchent xlsx (129 tests) ; dans l'api, les imports du
  lot L3, le plan de transport et les services départementaux. Build Vite de l'admin et `tsc` de
  l'admin et de l'app : pas de nouvelle erreur par rapport à `main`.
