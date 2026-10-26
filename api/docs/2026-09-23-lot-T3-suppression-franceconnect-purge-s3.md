# Lot T3 — suppression de FranceConnect et purge S3 au soft-delete : M46, M47, M48

Date : 2026-09-23 · Audit sécurité du 21/09/2026 · Branche `feat/audit-securite-t3-franceconnect-d95e38`, base `origin/main` (`c6898a311`)

Les trois constats ont été relus sur le code courant avant correction : tous confirmés.

## M46, M47 — FranceConnect supprimé

FranceConnect ne servait qu'aux représentants légaux, sur les pages de consentement et de droit à
l'image. Ces parcours ne sont plus proposés : il n'y a plus d'inscriptions, et le dispositif est en
phase 2. Les routes, elles, restaient publiques et appelables. Plutôt que de corriger le flux, il
est supprimé.

| Id | Route | Avant | Après |
|---|---|---|---|
| M46 | `POST /young/france-connect/authorization-url` | anonyme, sans limite de débit, deux clés Redis de 30 min par appel | route supprimée (404) |
| M47 | `POST /young/france-connect/user-info` | state et nonce jamais consommés, id_token lu par `jwt.decode`, jetons FranceConnect envoyés à Sentry en cas d'échec | route supprimée (404) |
| (M28, M29) | `PUT /representants-legaux/representant-fromFranceConnect/:id` | seul consommateur de l'identité FranceConnect (ticket à usage unique, #5349) | route supprimée (404) |

Supprimés aussi :

- **API** : `young/franceConnectIdentity.ts` et les variables `FRANCE_CONNECT_URL`, `FRANCE_CONNECT_CLIENT_ID`, `FRANCE_CONNECT_CLIENT_SECRET`.
- **App** : `FranceConnectButton`, la page `/representants-legaux/france-connect-callback`, et le bouton sur les pages de consentement et de droit à l'image, qui ne gardent que la saisie manuelle. `VITE_FRANCE_CONNECT_URL` est aussi retirée.

Conservés : les champs `parent1FromFranceConnect` et `parent2FromFranceConnect`. Ils restent dans le
schéma, l'affichage de l'admin, l'anonymisation et le cron `deleteLegalRepresentatives`, pour
l'historique. Plus aucune route ne les passe à `"true"` côté parent. `validateYoung`
(`POST /young/invite`, `PUT /referent/young/:id`, réservées aux référents) les accepte toujours.

Les variables `FRANCE_CONNECT_*` et `VITE_FRANCE_CONNECT_URL` peuvent être retirées des
environnements Clever Cloud après déploiement, et le client déclaré chez FranceConnect peut être clos.

## M48 — purge S3 au soft-delete

| Route | Avant | Après |
|---|---|---|
| `PUT /young/:id/soft-delete` | boucle sur les caractères du nom de chaque clé de `young.files` → `deleteFile(".../undefined")`, aucun binaire supprimé, puis document vidé | `purgeYoungFiles(id)` : `listFiles("app/young/<id>/")` + `deleteFilesByList`, jusqu'à préfixe vide. Couvre aussi les pièces de candidature, d'équivalence et de préparation militaire. Exécuté **avant** toute écriture en base : échec S3 → 500, rien n'est effacé, la suppression reste rejouable. Nombre de fichiers supprimés journalisé |

### Rattrapage

`api/src/scripts/purgeSoftDeletedYoungFiles.effect.ts` purge le préfixe S3 de tous les volontaires
au statut `DELETED` (même helper que la route). Les volontaires anonymisés par
`anonymizeOldCohorts` ont déjà un préfixe vide et ressortent à 0.

```
DRY_RUN=true npx tsx src/scripts/purgeSoftDeletedYoungFiles.effect.ts          # compte les objets restants
YOUNG_ID=<objectId> npx tsx src/scripts/purgeSoftDeletedYoungFiles.effect.ts   # un volontaire
npx tsx src/scripts/purgeSoftDeletedYoungFiles.effect.ts                       # run complet
```

La suppression S3 est définitive : lancer d'abord le DRY_RUN.

## Démonstration

Tests ajoutés, lancés sur le code d'avant correctif :

- `france-connect-routes-supprimees.test.ts` : les 3 routes répondaient encore (3 échecs) ; elles répondent désormais par le 404 par défaut d'Express.
- `young-soft-delete-files.test.ts` : `listFiles` n'était jamais appelé et les deux fichiers restaient dans le bucket ; un échec S3 n'empêchait pas l'anonymisation (200 au lieu de 500).

Les tests M28/M29 de `representants-legaux-security.test.ts` et les deux tests FranceConnect de
`young.test.ts` portaient sur les routes supprimées. Ils sont retirés.

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `france-connect-routes-supprimees`, `young-soft-delete-files`, `young`, `representants-legaux-security`, `auth-anti-abus` | 5 suites, 78 réussis, 2 ignorés (préexistants) |
| `tsc -p tsconfig.check.json --noEmit` (api) | erreurs `TS6307` préexistantes, sans rapport ; 0 sur les fichiers modifiés |
| `eslint` (api, app) sur les fichiers modifiés | 0 erreur |
