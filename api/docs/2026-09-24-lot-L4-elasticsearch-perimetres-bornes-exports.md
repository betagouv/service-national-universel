# Lot L4 — Elasticsearch et exports : périmètres, bornes, formules (M16, M17, L10, L11, L12, L13, L14, L15, L36)

Date : 2026-09-24 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-33 · Branche `fix/goo-33-lot-l4-elasticsearch-exports`, base `origin/main` (`2484ebe28`)

Tous les constats étaient encore ouverts sur `origin/main`.

## Ce qui change

| Id | Avant | Après |
|---|---|---|
| M17 | `sessionphase1` (search, export, young-affectation) ouvert par `canSearchInElasticSearch` aux chefs de centre, au transporteur et aux rôles CLE, sans aucun filtre | réservé à `canViewSejourHistory` (admin, référents), comme les autres lectures des séjours (`sejourAccess`) ; référents bornés à leur région / département |
| M16 | `modificationbus` sans filtre pour les référents | filtre `lineId` sur les lignes du territoire ; admin et transporteur restent nationaux ; tout autre rôle → 403 |
| L12 | `lignebus/search` sans périmètre ; `by-point-de-rassemblement/aggs` sans aucun rôle | `canSearchLigneBus` sur les deux routes et filtre de territoire (centre **ou** point de rassemblement) pour les référents ; appliqué aussi à `lignebus/export` ; rôles de centre refusés |
| L14 | `pointderassemblement` sans contrôle de rôle | `canSearchMeetingPoints` (admin, référents, transporteur) ; référents bornés à leur région / département |
| L11 | chef de centre sans session → agrégations nationales ; `youngsReport` sans validation ni contrôle pour le visiteur ; `getInAndOutCohort` sans filtre pour le visiteur | 403 quand la session est absente ; corps de `youngsReport` validé par Joi (`filters.cohort`, `department`) et département vérifié pour chaque rôle (visiteur borné à sa région) ; visiteur borné à sa région sur `getInAndOutCohort` |
| L15 | `schoolramses/public/search` anonyme, 10 000 établissements par appel | compte référent exigé (`canSearchInElasticSearch(…, "schoolramses")`) ; 1 000 résultats avec un filtre (ville, pays, département), 50 sans ; `size` du corps validé ; `searchCity` validé (2 à 100 caractères) et remis dans la requête booléenne (il cassait les filtres) |
| L10 | `association/search|export` relayait le corps client à l'API Engagement, export jusqu'à 1 000 pages | route supprimée : l'écran Associations a été retiré de l'admin (#5235), plus aucun appelant |
| L13 | `mission/young/search` et `missionapi/search` : `size` non plafonné | `size` plafonné à 100, `page` à 99 (`from + size` ≤ 10 000) ; plafonnés sans rejet. L'offset est désormais `page * size` : il valait `page * 20` alors que le front pagine à 10, 20, 40 ou 50 |
| L36 | cellules `=`, `+`, `-`, `@`, tabulation, CR écrites telles quelles dans les CSV générés côté serveur | helper `neutralizeSpreadsheetFormula` / `neutralizeSpreadsheetRow` (snu-lib) : préfixe `'`. Appliqué à `generateCSVStream` (api : rapports d'import centres, sessions, PDR), `FileProvider.generateCSV` (apiv2 : liste de diffusion Brevo) et `generateCsvBuffer` (snu-lib, export Brevo de l'admin) |

### Choix

- **Périmètre d'une ligne dans une liste.** La fiche d'une ligne (lot L1) est rattachée au seul centre
  de destination. Une liste doit aussi montrer au référent les lignes qui **partent** de son territoire :
  c'est ce qu'il gère au quotidien, et l'export borne déjà les jeunes aux points de rassemblement de
  son territoire. Ces index ne portent que des métadonnées de transport. Helpers : `getLigneBusScope`,
  `getLigneBusScopeEsFilter`, `getLigneBusIdsInScope`, `getGeoScopeEsFilter` dans `services/sejourAccess.ts`.
- **XLSX non modifiés.** SheetJS et ExcelJS écrivent une chaîne dans une cellule texte (`t: "s"`), jamais en
  formule : `=1+1` s'affiche tel quel à l'ouverture (vérifié). Préfixer ces cellules aurait ajouté une
  apostrophe visible dans les exports (numéros `+33…`, textes commençant par `-`) sans gain de sécurité.
  Le risque résiduel (l'utilisateur édite la cellule puis valide) n'est pas couvert.
- **CSV : effet de bord accepté.** Une valeur texte commençant par `-` ou `+` (ex. `+33 6…`) sort
  désormais avec une apostrophe. Les nombres ne sont pas touchés.
- `canSearchInElasticSearch` (snu-lib) n'est pas modifié : il pilote aussi l'affichage du front. Le
  contrôle se fait dans les contrôleurs.

## Démonstration

- `api/src/__tests__/elasticsearch-lot-l4.test.ts` — 36 cas : transporteur, rôles CLE et chefs de centre
  refusés sur `sessionphase1` ; référent départemental → seules les lignes de son territoire dans le filtre
  `lineId` (y compris une ligne qui part de chez lui vers un centre extérieur) ; transporteur national ;
  aggs `lignebus` refusées à un responsable ; PDR refusés aux responsable / superviseur / visiteur ;
  visiteur hors région → 403 sur `youngsReport` ; chef de centre sans session → 403 sans requête ES ;
  `schoolramses` : stratégie `referent` exigée, 50 / 1 000 résultats, `size: 10000` → 400 ; missions
  jeune `size: 10000` → 100, offset `page * size` ; `association` → 404.
  Contre-épreuve sur le code d'origine : 27 cas sur 36 échouent (les 9 autres vérifient les accès légitimes).
- `api/src/services/fileService.test.ts`, `packages/lib/src/utils/csvGenerator.spec.ts`,
  `apiv2/src/shared/infra/File.provider.spec.ts` — `=1+1` → `'=1+1`, nombres négatifs intacts.

Suites voisines relancées en série et vertes : `elasticsearch-*`, `mission*`, `session-phase1-perimetre`,
`sejours-transport-security`, `plan-de-transport-perimetre-lot-l1`, `young-security`, `cohesion-center*`.

## Hors périmètre / à surveiller

- L'index `plandetransport` (liste du plan de transport) ne borne toujours pas les référents à leur
  territoire : non relevé par l'audit, même traitement possible avec `getLigneBusScopeEsFilter`.
- `sessionphase1?needHeadCenterInfo=true` joint le document référent du chef de centre depuis l'index
  `referent` ; réservé désormais à l'admin et aux référents, mais sans projection.
- Pas de limitation de débit dédiée sur `schoolramses/public/search` : la route n'est plus anonyme.
- Les exports XLSX construits **dans le navigateur** (admin) relèvent de l'audit des fronts.
