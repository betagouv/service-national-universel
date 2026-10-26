# GOO-7 — base de connaissance : URL Slate et accès aux sessions de l'API (FH17, FH16, FL9, FL8 ; M85)

Date : 2026-09-23 · Audit sécurité des fronts du 23/09/2026 · Base `origin/main` (`5d824f300`)

Les quatre constats ont été relus sur le code courant avant correction : tous confirmés.

## Ce qui change

| Id | Où | Avant | Après |
|---|---|---|---|
| FH17 / M85 | `snupport-api PUT /knowledge-base/:id/content` | contenu Slate enregistré sans contrôle | tout nœud portant une `url` est vérifié (`utils/knowledgeBaseContent.js`) : lien = `http`, `https`, `mailto` ou chemin interne `/…` (sans `//` ni `/\`) ; image = `http(s)` ; vidéo = `https://player.vimeo.com` uniquement → sinon 400, rien n'est enregistré |
| M85 | `snupport-api PATCH /knowledge-base/:id` | `imageSrc: Joi.string().uri()` (tout schéma) | `imageSrc` limité à `http` et `https` |
| FH17 | `knowledge-base-public` (rendu des articles) | `href`, `src` d'image et `src` d'iframe tirés tels quels du contenu | même liste blanche au rendu (`src/utils/safeUrl.js`) : lien invalide sans `href`, image sans `src`, iframe non rendue |
| FH17 | `snupport-app` (éditeur de la base de connaissance) | idem, et `is-url` acceptait `javascript://…` | filtre au rendu, à la saisie (modale, collage d'un lien, insertion d'image) et à l'import HTML collé |
| FH16 | `api` `passport.getToken` | cookies `jwt_ref`/`jwt_young` acceptés depuis l'origine de la KB, avec les credentials CORS : une XSS sur la KB agissait sur toute l'API v1 avec la session du lecteur | la branche KB est retirée : depuis la KB, aucune route passport ne voit la session |
| FH16 / FL9 | `api GET /signin/token` | seule route à servir la KB ; renvoyait le profil sérialisé complet (santé et représentants légaux d'un jeune) | lit elle-même le cookie depuis l'origine de la KB et ne renvoie que `role`, `subRole`, `source`, `initials` et `allowedRole` |
| FH16 | `api POST /signin/logout` (nouvelle) | la KB appelait `/referent/logout` et `/young/logout`, passés par passport | déconnexion depuis la KB : même contrôle de session que `/signin/token`, met à jour `lastLogoutAt` et efface le cookie |
| FH16 | `snupport-api` `passport.getToken` | cookie agent `jwtzamoud` accepté depuis l'origine de la KB, autorisée par le CORS avec credentials | cookie ignoré quand l'origine est `SNUPPORT_URL_KB` ou `KNOWLEDGE_BASE_PUBLIC_URL`, sauf si elle est aussi celle de l'interface agent |
| FH16 | `knowledge-base-public` client HTTP | `credentials: "include"` vers les deux API | cookies envoyés à l'API v1 seulement ; les requêtes vers snupport-api partent en `omit` |
| FL9 | `knowledge-base-public` cache SWR | recopié dans `sessionStorage` (`snu-user-cache`) | cache en mémoire ; la clé laissée par les versions précédentes est effacée au chargement |
| FL8 | `knowledge-base-public /api/revalidate-sitemap` | secret lu dans la query alors que snupport-api l'envoie dans le corps d'un POST : l'appelant légitime était toujours refusé, et la route était ouverte à tous si `REVALIDATION_TOKEN` était absent | POST uniquement (405 sinon), secret lu dans le corps, refus si `REVALIDATION_TOKEN` est absent, comparaison à temps constant |

## Démonstration

- `api/src/__tests__/knowledge-base-session.test.ts` (7 tests) : 5 échouent sur l'ancien code pour la
  raison attendue (cookie accepté depuis la KB, profil complet renvoyé, `/signin/logout` absent).
- `snupport-api/src/__tests__/knowledgeBaseContent.routes.test.js` : les iframes et liens en
  `javascript:` étaient enregistrés (200) avant le correctif.
- `snupport-api/src/__tests__/knowledgeBaseContent.test.js` et `passportKnowledgeBaseOrigin.test.js` :
  liste blanche et refus du cookie agent.
- `/api/revalidate-sitemap` sur `next start` : GET → 405, mauvais secret → 401, bon secret → 200,
  sans `REVALIDATION_TOKEN` → 401.

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `snupport-api` — suite complète | 26 suites, 213/213 |
| `api` — session KB, référent, jeune, 2FA, snupport, anti-abus | 103 passés, 6 ignorés (un test en rafale d'`auth-anti-abus` échoue par intermittence en lancement groupé, vert seul) |
| `api` — `tsc -p tsconfig.check.json --noEmit` | 2 erreurs préexistantes, 0 sur les fichiers modifiés |
| `snupport-api` — `tsc -p tsconfig.build.json --noEmit` | 0 erreur |
| `knowledge-base-public` — `next build` (plugin Sentry désactivé en local) | OK |
| `snupport-app` — `vite build` | OK |

## Points d'attention

- **Produit** : depuis la KB, le feedback (`POST /SNUpport/knowledgeBase/feedback`, `optionalAuth`)
  part désormais sans session, donc sans `contactEmail`.
- Les credentials CORS de l'API v1 restent accordés à l'origine KB : seules `/signin/token` et
  `/signin/logout` s'en servent, et elles n'exposent que le rôle et les initiales.
- Déploiement : l'API et la KB peuvent partir dans n'importe quel ordre. Une KB ancienne face à la
  nouvelle API affiche un avatar sans initiales et sa déconnexion reçoit un 401.
- La revalidation du plan du site fonctionne maintenant réellement : `REVALIDATION_TOKEN` doit être
  défini, et identique, sur la KB et sur snupport-api.
- Reste à faire : contrôle en base des articles existants (une URL non conforme n'est plus rendue,
  mais reste stockée) et CSP de support.snu.gouv.fr (GOO-17). À terme, les trois filtres locaux sont à
  remplacer par le filtre partagé de snu-lib (GOO-19).
- La lecture anonyme des articles restreints (`allowedRole`/`status` choisis par le client, M86) et
  `POST /feedback` (M83) relèvent de GOO-23.
