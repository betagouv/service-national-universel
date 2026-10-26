# GOO-8 — télémétrie des fronts sans secrets ni PII : Sentry et Plausible (FH7, FM4, FM5, FM6, FM14, FM15, FM20)

Date : 2026-09-23 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`68e7252c4`)

Les constats ont été relus sur le code courant avant correction : confirmés. Aucun des trois fronts (admin, app,
snupport-app) n'avait de `beforeSend`. L'admin et l'app posaient `sendDefaultPii: true` avec
`httpClientIntegration()` et `replayIntegration()`. Le JWT de l'admin (en-tête `Authorization`) partait donc
vers Sentry par trois canaux : l'extra `token` de `checkToken`, les en-têtes des réponses 5xx (httpClient), et
le contexte `AxiosError` des erreurs apiv2 (`extraErrorDataIntegration` sérialise `config.headers` et `config.data`).

## Ce qui change

| Où | Avant | Après |
|---|---|---|
| `@snu/log-redaction` | hooks pour l'API seulement | `redactFrontSentryEvent` (`beforeSend`, `beforeSendTransaction`) et `redactFrontBreadcrumb` (`beforeBreadcrumb`). Les corps de requête et de réponse sont **retirés** (`body`, `data`, `response`, `responseText`, `request`), ainsi que la query string et le fragment de toute URL (requête, en-têtes `Referer`, breadcrumbs, spans, messages d'erreur). Les jetons portés par le chemin (`/contract/token/<jeton>`, `/young/validate_phase3/<id>/<jeton>`) sont masqués. Le contexte `state` (Redux) est supprimé, tout comme les breadcrumbs `console`. Si la redaction échoue, l'événement est abandonné. Une sortie ESM (`dist/esm`, champ `module`) permet l'import par Vite |
| admin, app `sentry.js` | `sendDefaultPii: true`, httpClient, Replay (100 % des sessions en erreur) | `sendDefaultPii: false`, hooks de redaction, httpClient et Replay retirés. Les variables `VITE_SENTRY_SESSION_SAMPLE_RATE` et `VITE_SENTRY_ON_ERROR_SAMPLE_RATE` sont supprimées |
| snupport-app `sentry.js` | aucun hook | hooks de redaction ; options de Replay mortes retirées (aucune intégration Replay n'était chargée) |
| admin, app, snupport-app `redux/store` | `Sentry.createReduxEnhancer()` : state complet joint à chaque événement (profil du volontaire, tickets, notes internes) | enhancer retiré |
| admin, app `setUser` | `{ id, email, username }` | `{ id }` |
| admin `services/api.ts` | extras `token: getJwtToken()`, `body` (mots de passe, jetons d'invitation, PII), `arr`/`properties` | `path` seulement |
| app `services/api.js` | extras `token`, `responseText` | `path`, statut HTTP |
| snupport-app `services/api.js` | extras `response`, `headers`, `query`, `body`, `responseText`, `files`, `properties` | `method`, `path`, statut HTTP |
| admin, captures ponctuelles | candidatures et dossiers jeunes complets (fiche sanitaire), réponse de `/SNUpport/signin`, URL de géocodage (adresse) | identifiants ou code d'erreur seulement |
| app `Preferences` | `console.log` des préférences de mission (nom et adresse d'un proche) | supprimé |
| Plausible (3 fronts) | `pageview` avec l'URL complète, dont `?advancedSearch=<email>` ; événements sans `u`, donc avec `location.href` | origine + chemin seulement, identifiants et jetons hexadécimaux remplacés par `:id`, pour la page vue comme pour les événements |

## Démonstration

`packages/log-redaction/src/__tests__/sentryFront.test.ts` rejoue les formes d'événement des constats : extra
`token` et `body`, contexte `AxiosError` avec `Authorization` et corps JSON, state Redux, requête avec cookies,
`Referer` à jeton et spans. Chaque test vérifie que le secret ou la donnée personnelle a disparu de l'événement.

## Vérification (Node 20)

| Contrôle | Résultat |
|---|---|
| `packages/log-redaction` — jest | 2 suites, 44/44 |
| `packages/log-redaction` — build CJS + ESM, `require` de la sortie CJS | OK |
| `app`, `snupport-app` — `tsc -p tsconfig.ci.json --noEmit` | 0 erreur |
| `admin` — `tsc -p tsconfig.ci.json --noEmit` | aucune erreur dans les fichiers modifiés (erreurs préexistantes ailleurs en worktree) |
| `admin`, `app`, `snupport-app` — `vite build` | OK ; la redaction est bien embarquée dans le bundle (sortie ESM) |
| eslint des fichiers modifiés | 0 erreur |

## Points d'attention

- **Replay retiré** plutôt que masqué : le masquage (`maskAllText`, `blockAllMedia`) ne rédige pas les URL que le
  Replay enregistre. Or l'admin affiche des données de santé de mineurs. Il pourra être réactivé plus tard, avec
  `beforeAddRecordingEvent` et une exclusion des routes à jeton.
- Le JWT de l'admin reste en `localStorage` : c'est l'objet de GOO-16.
- **Non traité ici** : retirer le jeton de l'URL visible (`history.replaceState`) sur les pages reset, contrat,
  invitation et validation phase 3. Ces pages relisent le jeton dans l'URL à chaque rendu, et un rechargement
  casserait le parcours. Côté Sentry, la fuite est fermée par le retrait de la query string.
- **Actions en production** : purger les événements Sentry existants qui contiennent des JWT ou des PII (projets
  admin 241, app 244, snupport 246) ; vérifier que le Data Scrubber côté serveur est actif.
- La base de connaissance publique n'est pas concernée : son Sentry est désactivé (`enabled: false`).
