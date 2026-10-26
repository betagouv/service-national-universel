# GOO-17 — en-têtes HTTP, sourcemaps et scripts tiers des fronts (FM27, FL10, FL12, FM3)

Audit des fronts du 2026-09-23. Vérifié et corrigé le 2026-09-24 sur `origin/main` @ `25a2b03ea`
(ticket Linear GOO-17). Les quatre constats étaient encore ouverts, configuration relue.

## 1. Constats et correctifs

| Id | Où | Défaut | Correctif |
| --- | --- | --- | --- |
| FL10 | `devops/build/front/nginx.conf` (app, admin, snupport-app), `devops/build/all/nginx.conf` (recettes), `knowledge-base-public/next.config.js` | fronts intégrables dans une iframe | `X-Frame-Options: DENY` et `Content-Security-Policy: frame-ancestors 'none'` appliqués |
| FM27 | mêmes fichiers | aucune CSP ni en-tête de sécurité ; version de nginx et `X-Powered-By: Next.js` affichés | CSP appliquée pour les directives sans effet sur le rendu (`frame-ancestors`, `base-uri`, `object-src`) ; politique cible en `Content-Security-Policy-Report-Only` (voir §2) ; `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy: same-origin` (SPA) ; `server_tokens off`, `poweredByHeader: false` |
| FL12 | `app/`, `admin/`, `snupport-app/vite.config.js` ; `knowledge-base-public/next.config.js` | sourcemaps complètes publiées avec le build | Vite : `sourcemap: "hidden"` + `sourcemaps.filesToDeleteAfterUpload` du plugin Sentry (supprimées même quand l'envoi n'a pas lieu) ; nginx : `*.map` → 404 en filet ; KB : `hideSourceMaps: true` puis suppression des `.map` de `.next/static` en fin de `build` |
| FM3 | `index.html` des trois SPA ; `knowledge-base-public/src/pages/base-de-connaissance/index.js` | scripts tiers exécutés sans restriction d'origine ; jstag.js (API Engagement) chargé aussi sur la KB | initialisation de Plausible sortie des `<script>` en ligne vers `public/plausible-init.js`, pour une `script-src` sans `unsafe-inline` ; hôtes tiers limités par la CSP à `plausible.io` et `app.api-engagement.beta.gouv.fr` ; jstag.js retiré de la KB |

## 2. Choix

- **CSP en deux temps.** La politique cible (`default-src 'self'`, `script-src` sans `unsafe-inline`,
  qui bloque aussi l'exécution des liens `javascript:`, `frame-src` limité à Vimeo) est publiée en
  Report-Only : les hôtes d'API et de fichiers varient selon l'environnement et un oubli casserait
  l'application. Après une période d'observation des violations dans la console des navigateurs, elle
  passe dans l'en-tête `Content-Security-Policy`. `style-src` garde `'unsafe-inline'` (styled-components,
  DSFR).
- **Scripts en ligne.** Les trois SPA n'en ont plus : le bloc API Engagement de app est un
  `<script type="module">` que Vite intègre au bundle (vérifié sur le build). La KB n'a que le bloc
  `__NEXT_DATA__` de Next, de type JSON, non concerné.
- **jstag.js.** Retiré de la KB : il sert à attribuer les candidatures aux missions venues des
  partenaires d'API Engagement, et la KB n'a ni mission ni candidature. Conservé sur app (production
  seulement, déjà le cas), où atterrit ce trafic : le retirer relève d'une décision produit.
- **Pas de SRI sur Plausible.** `plausible.io` publie ses scripts sans version : une empreinte SRI
  casserait les statistiques à leur prochaine mise à jour. La CSP limite l'origine ; l'auto-hébergement
  reste possible (voir §3).
- **HSTS sans `includeSubDomains`**, pour ne pas imposer HTTPS à des sous-domaines de `snu.gouv.fr` hors
  de ce dépôt.

## 3. Hors périmètre / suites

- Passer la CSP de Report-Only à appliquée après observation, et lui ajouter un point de collecte
  (`report-uri` vers l'endpoint sécurité de Sentry) : l'en-tête nginx est commun aux trois SPA, alors
  que les projets Sentry sont distincts.
- Auto-héberger le script Plausible (ou le proxifier) pour se passer du tiers.
- `devops/build/docker/Dockerfile.front` sert la configuration nginx par défaut ; il n'est appelé par
  aucun workflow ni script de déploiement.

## 4. À faire en production

- Après déploiement : `curl -sI` sur moncompte, admin, admin-support et support pour contrôler les
  en-têtes ; `curl -sI https://admin.snu.gouv.fr/assets/<chunk>.js.map` doit répondre 404.
- Surveiller la console des navigateurs (violations Report-Only) pendant la période d'observation.

## 5. Vérifications

- Builds Vite de app, admin et snupport-app en mode production : aucun `.map` dans `build/`, aucun
  `<script>` en ligne dans `build/index.html`, `plausible-init.js` copié.
- Build Next de la KB puis `next start` : en-têtes présents, pas de `X-Powered-By`, aucun `.map` sous
  `.next/static`, `/_next/static/chunks/main.js.map` → 404.
- nginx n'est pas installé sur le poste : la syntaxe des deux `nginx.conf` n'a pas été validée par
  `nginx -t` ; elle le sera au premier déploiement de recette.
