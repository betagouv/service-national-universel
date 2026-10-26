# Lot R2 — base de connaissance : lecture par rôle et feedback (M86, M83 ; M85)

Date : 2026-09-23 · Audit sécurité des API du 21/09/2026 · Ticket GOO-23 · Base `origin/main` (`4587c1d70`)

Les constats ont été relus sur le code courant avant correction. M86 et M83 étaient toujours ouverts.
M85 était déjà corrigé par #5364 (GOO-7) : `PUT /knowledge-base/:id/content` refuse toute URL de
nœud Slate hors liste blanche, et `imageSrc` est limité à `http(s)`. Le lot n'y revient pas.

## Ce qui change

| Id | Où | Avant | Après |
|---|---|---|---|
| M86 | `snupport-api GET /knowledge-base/:allowedRole`, `/:allowedRole/:slug`, `/:allowedRole/search`, `POST /:allowedRole/siblings` | le rôle du lecteur venait de l'URL : un anonyme lisait `/knowledge-base/admin` (la recherche `admin` ne filtre sur aucun rôle) | un rôle autre que `public` exige une preuve, sinon 403 : clé d'API (l'API v1), agent éditeur de la base (support central), ou jeton de lecture qui porte ce rôle |
| M86 | `snupport-api GET /:allowedRole/search` | `status=DRAFT` ou `ARCHIVED` lu dans la query ; sans `status`, tous les statuts | `PUBLISHED` imposé, sauf pour l'API v1 et les éditeurs (l'éditeur du support cherche des brouillons pour créer des liens) |
| M86 | `snupport-api POST /:allowedRole/siblings` | filtre sur `allowedRole`, un champ absent du modèle, et aucun filtre de statut | `{ parentId, allowedRoles: <rôle>, status: "PUBLISHED" }` |
| M86 | `snupport-api POST /v0/knowledge-base/reader-token` (nouvelle) | — | clé d'API obligatoire : signe un jeton de lecture (8 h) pour la liste de rôles demandée. Il est signé avec une clé dérivée de `JWT_SECRET` (HMAC), donc impossible à confondre avec une session agent |
| M86 | `api GET /signin/token` | renvoyait `allowedRole`, que la KB recopiait dans l'URL | calcule côté serveur les rôles lisibles du compte (`services/knowledgeBaseReader.ts`) et renvoie en plus `knowledgeBaseToken`, obtenu auprès de snupport-api. Si snupport-api ne répond pas, la réponse part sans jeton : le lecteur voit la base publique |
| M86 | `api GET /SNUpport/knowledgeBase/search` | il suffisait d'être connecté pour passer n'importe quelle `restriction` (`admin` compris) | la `restriction` doit faire partie des rôles lisibles du compte, sinon 403 |
| M86 | `knowledge-base-public` | — | le jeton de `/signin/token` part dans `Authorization: KnowledgeBaseReader …`, et seulement vers l'API du support |
| M83 | `snupport-api POST /feedback` | route publique, créait un contact pour tout email fourni, sans contrôler l'article, commentaire sans limite | clé d'API obligatoire (seule l'API v1 l'appelait), l'article doit être un article publié (404 sinon), commentaire de 2000 caractères au plus. Un email connu rattache le feedback au contact existant ; un email inconnu ne crée plus rien |
| M83 | `api POST /SNUpport/knowledgeBase/feedback` | aucune limitation, commentaire jusqu'à 5000 caractères | 10 feedbacks par IP toutes les 10 minutes (Redis, 429 au-delà), commentaire de 2000 caractères au plus |

### Rôles lisibles par compte

Ils reprennent ce que les interfaces demandaient déjà, pour que personne ne perde un article :

- le rôle de lecture de `/signin/token` (`allowedRole`) ;
- les rôles du menu « Voir en tant que » de la KB (`AdminMenu.jsx`) ;
- le rôle de recherche du centre d'aide de l'admin (`support-center/dashboard.jsx`).

| Compte | Rôles lisibles (en plus de `public`) |
|---|---|
| admin, DSNJ, INJEP | tous : le centre d'aide de l'admin cherchait déjà en `admin` pour DSNJ et INJEP |
| référent départemental ou régional | `referent` + les rôles de son « Voir en tant que » |
| responsable, superviseur | `structure` |
| chef de centre, adjoint, référent sanitaire | leur rôle + `head_center` |
| visiteur, transporteur | `visitor`, `transporter` |
| administrateur CLE | `administrateur_cle` + les rôles du « Voir en tant que » de son sous-rôle |
| référent de classe | les rôles de son « Voir en tant que » (dont `referent_classe`) |
| volontaire | `young` (+ `young_cle` si source CLE) |

## Démonstration

- `snupport-api/src/__tests__/knowledgeBaseReader.routes.test.js` (31 tests, vraies stratégies
  passport) : 21 échouent sur l'ancien code (lecture anonyme de `admin`/`referent`/`young`,
  brouillons en recherche, siblings sans filtre, feedback anonyme, contact créé, article non
  vérifié, commentaire non borné). Les 10 autres sont nouveaux sur la route de jeton ou vérifient
  que les accès légitimes restent ouverts.
- `api/src/__tests__/snupport.test.ts` et `knowledge-base-session.test.ts` : 9 tests échouent sur
  l'ancien code (restriction hors rôle, jeune en `admin`, commentaire trop long, rate limiting,
  jeton de lecture absent de `/signin/token`).

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `snupport-api` — suite complète | 34 suites, 312/312 |
| `snupport-api` — `tsc -p tsconfig.build.json --noEmit` | 0 erreur |
| `api` — `snupport.test.ts` + `knowledge-base-session.test.ts` | 54/54 (ts-jest en `isolatedModules` : le type-check de ts-jest échoue dans le worktree sur les doubles types mongodb, un problème connu sans lien avec ce lot) |
| `api` — `tsc -p tsconfig.check.json --noEmit` | aucune erreur dans les lignes modifiées (erreurs préexistantes du worktree ailleurs) |
| `knowledge-base-public` — fichiers modifiés | syntaxe vérifiée (`node --check`), `next build` non relancé |

## Points d'attention

- **Ordre de déploiement** : snupport-api d'abord (route de jeton), puis l'API v1 et la KB publique.
  Tant que l'API v1 n'est pas à jour, les lecteurs connectés de la KB ne voient que la base publique.
  L'ordre inverse n'est pas gênant : sans jeton, l'API v1 renvoie `knowledgeBaseToken: null`.
- **Produit** : `POST /siblings` renvoyait toujours une liste vide (le filtre `allowedRole` ne
  correspondait à rien). La navigation entre articles d'une même rubrique va réellement afficher
  les articles voisins publiés.
- Les agents qui ne sont pas éditeurs de la base (référents synchronisés dans le support) ne lisent
  plus les rôles réservés via snupport-api. Ils passent par la KB, avec le jeton de leur compte SNU.
- Hors périmètre, relevé en passant : `POST /knowledge-base/all`, `GET /feedback`,
  `PUT /feedback/archivefeedbacks` et `GET /feedback/usefulArticles` restent ouverts à tout agent,
  sans condition d'éditeur (brouillons compris). Cela relève du lot P (administration réservée au
  support central). La recherche publique enregistre aussi un `kbSearch` à chaque appel, sans
  limitation.
