# GOO-18 (fin) : Next.js de la KB et Sentry de snupport-app (FM22, FM11)

Suite de #5387 et #5394. Vérifié et corrigé le 2026-09-24 sur `origin/main` @ `1eceec3a9`
(ticket Linear GOO-18). Code et `npm audit` relus avant correction.

## 1. Constats et correctifs

| Id | Où | Défaut vérifié | Correctif |
| --- | --- | --- | --- |
| FM22 | knowledge-base-public, `next` 13.5.11 | `npm audit` : 23 avis ouverts sur Next.js, dont 2 critiques (RCE de l'optimiseur d'images avec AVIF, corrigée en 15.5.24), SSRF dans les rewrites, contournement du middleware en Pages Router avec i18n, confusion de cache. La branche 13.x n'est plus maintenue ; la 14.2.35 (dernière 14.x) reste vulnérable à tous ces avis | `next` ^15.5.26 (branche maintenue `backport`). La KB est en Pages Router : React 18.2 reste supporté, aucune page à réécrire. `optimizeFonts` (option retirée en 15) supprimée. `outputFileTracingRoot` fixé au dossier de la KB, hors des workspaces npm |
| FM22 | knowledge-base-public, `@sentry/nextjs` 7.77.0 | incompatible avec Next 15 ; embarque `@sentry/browser` 7 (pollution de prototype < 7.119.1) | `@sentry/nextjs` ^10.75.3. L'init serveur passe par `src/instrumentation.js` (le SDK n'injecte plus `sentry.server.config.js`), l'init client par `src/instrumentation-client.js` (ex-`sentry.client.config.js`). `hideSourceMaps` (retiré en v9) est remplacé par `sourcemaps.deleteSourcemapsAfterUpload` ; le build supprime toujours les `.map` de `.next/static`. Télémétrie de build Sentry coupée |
| FM11 | snupport-app, `@sentry/react` 7.x + `@sentry/integrations` + `@sentry/tracing` | SDK 7 en fin de vie, `@sentry/browser` 7 vulnérable (pollution de prototype < 7.119.1) | `@sentry/react` ^8.55.2, même version et même configuration que l'admin et app : intégrations fonctionnelles, transport hors ligne `makeBrowserOfflineTransport` à la place de l'intégration `Offline`, `tracePropagationTargets` limité à l'API support, `sendDefaultPii: false` explicite. Les filtres `@snu/log-redaction` sont inchangés |

Sentry reste désactivé dans la KB (`enabled: false` dans les deux init) : le changement ne modifie
pas ce qui est envoyé.

## 2. Non fait

- **sanitize-html** 2.17.7 : attend la migration Node 22 (voir la note précédente de GOO-18).
- `npm audit --omit=dev` de la KB signale encore `postcss` 8.4.31, version exacte imposée par
  Next.js 15.5.26 (d'où l'avis « moderate » reporté sur `next`). postcss n'y traite que les CSS du
  dépôt au build, jamais une entrée utilisateur. Seul Next 16 le lève.

## 3. À faire en production

- Rien de spécifique. La KB se construit et démarre comme avant (`next build`, `next start`).

## 4. Tests

- KB : `next build` sans avertissement, puis `next start` : en-têtes de sécurité inchangés
  (CSP, X-Frame-Options, HSTS…), redirection `/` → `/base-de-connaissance` en 308,
  `/_next/image` en 404, aucun `.map` servi, page d'accueil hydratée sans erreur console.
- `npm audit --omit=dev` de la KB : de 16 paquets signalés (dont `next` en critique) à 2 (le
  `postcss` de build ci-dessus). `npm audit fix` sans montée majeure a aussi relevé lodash
  (via slate-react), nanoid, braces, micromatch, etc. `eslint src` passe.
- snupport-app : `sentry.js` empaqueté avec `@sentry/react` 8.55.2 et exécuté sous jsdom. Le client
  s'initialise avec la bonne cible de propagation et `sendDefaultPii: false`, et un événement part
  vers le DSN via le transport hors ligne. Le build Vite complet n'a pas pu être relancé dans le
  worktree (installation bloquée) : la CI le fait.
