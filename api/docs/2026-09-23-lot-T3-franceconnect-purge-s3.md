# Lot T3 — flux FranceConnect et purge S3 au soft-delete : M46, M47, M48

Date : 2026-09-23 · Audit sécurité du 21/09/2026 · Branche `feat/audit-securite-t3-franceconnect-d95e38`, base `origin/main` (`c6898a311`)

Les trois constats ont été relus sur le code courant avant correction : tous confirmés.

## Ce qui change

| Id | Route | Avant | Après |
|---|---|---|---|
| M46 | `POST /young/france-connect/authorization-url` | anonyme, sans limite de débit ; deux clés Redis indépendantes (`franceConnectNonce:*`, `franceConnectState:*`) de 30 min par appel | limiteur par IP dédié (`franceConnectRateLimiter`, 60 req / 15 min, compteur Redis) ; **une** clé `franceConnect:authState:<state>` → `{ nonce, binding }`, TTL 10 min |
| M47 | `POST /young/france-connect/user-info` | state et nonce vérifiés par simple existence, jamais supprimés (rejouables) ; id_token lu par `jwt.decode` ; state utilisable depuis n'importe quel navigateur | state consommé par **GETDEL** avant tout appel à FranceConnect ; il doit avoir été émis pour ce navigateur (cookie httpOnly `fc_binding`, dont seule l'empreinte SHA-256 est stockée) ; id_token vérifié par `jose` : signature (clés JWKS `${FRANCE_CONNECT_URL}/jwks` pour ES256/RS256, `client_secret` pour HS256), `iss` = `FRANCE_CONNECT_URL`, `aud` = `FRANCE_CONNECT_CLIENT_ID`, `exp`, puis `nonce` = celui du state. Réponse userinfo : signature vérifiée si elle est signée (`application/jwt`, FranceConnect v2), et `sub` égal à celui de l'id_token. Tout échec → 403. Même limiteur que M46 |
| M47 | idem | la réponse complète du serveur de jetons (access_token, id_token) partait dans Sentry en cas d'échec | seuls `status`, `error`, `error_description` sont remontés |
| M48 | `PUT /young/:id/soft-delete` | boucle sur les caractères du nom de chaque clé de `young.files` → `deleteFile(".../undefined")`, aucun binaire supprimé, puis document vidé | `purgeYoungFiles(id)` : `listFiles("app/young/<id>/")` + `deleteFilesByList`, jusqu'à préfixe vide. Couvre aussi les pièces de candidature, d'équivalence et de préparation militaire. Exécuté **avant** toute écriture en base : échec S3 → 500, rien n'est effacé, la suppression reste rejouable. Nombre de fichiers supprimés journalisé |

Le cookie `fc_binding` suit `cookieOptions` (httpOnly, `SameSite=Lax`, domaine `.snu.gouv.fr` en
production) ; le front l'envoie déjà, toutes ses requêtes API portant `credentials: "include"`. Aucun
changement front.

## Rattrapage

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

16 tests ajoutés (`france-connect-security.test.ts`, `young-soft-delete-files.test.ts`), lancés
sur le contrôleur d'avant correctif :

- M46 : 61ᵉ appel accepté (200 au lieu de 429).
- M48 : `listFiles` jamais appelé, les deux fichiers restent dans le bucket ; un échec S3 n'empêche
  pas l'anonymisation (200 au lieu de 500).
- M47 : le flux d'avant ne pose pas de cookie de liaison, les tests ne peuvent donc pas s'y dérouler
  jusqu'au bout. Ils couvrent, après correctif : state inconnu, rejeu, signature d'une autre clé,
  jeton non signé (`alg: none`), HS256 avec un autre secret, nonce d'un autre state, audience,
  émetteur, expiration, state présenté depuis un autre navigateur, `sub` du userinfo différent.

Les deux tests FranceConnect de `young.test.ts`, qui signaient l'id_token avec une clé quelconque,
sont remplacés par ceux-ci.

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `france-connect-security`, `young-soft-delete-files`, `young`, `representants-legaux-security` | 4 suites, 79 réussis, 2 ignorés (préexistants) |
| `tsc -p tsconfig.check.json --noEmit` | erreurs `TS6307` préexistantes, sans rapport ; 0 sur les fichiers modifiés |
| `eslint` sur les fichiers modifiés | 0 erreur |
| `GETDEL` sur Redis 7 réel | valeur rendue au premier appel, `null` au second |

## Points d'attention

- **Nouvelle dépendance** : `jose@^5` dans `api` (CommonJS, sans dépendance transitive).
- **Version de FranceConnect en production, non vérifiée** : la valeur par défaut de
  `FRANCE_CONNECT_URL` pointe sur `/api/v1`, qui ne répond plus (l'hôte d'intégration v1 ne résout
  plus, `app.franceconnect.gouv.fr/api/v1/*` redirige vers la vitrine). Le correctif suppose la v2
  (`https://oidc.franceconnect.gouv.fr/api/v2`) : `iss` doit être égal à `FRANCE_CONNECT_URL` au
  caractère près (hors `/` final). En v2, le endpoint de déconnexion est `/session/end`, alors que
  `FranceConnectCallback.jsx` appelle `${franceConnectUrl}/logout` : à vérifier côté front.
- **Algorithme de l'id_token** : ES256, RS256 et HS256 sont acceptés, chacun avec sa seule clé
  légitime. Une clé publique n'est jamais utilisée comme secret HMAC.
- **Sortie réseau** : l'API télécharge les clés publiques de FranceConnect (mises en cache par `jose`).
- Un state présenté sans le bon cookie est consommé quand même : un lien FranceConnect piégé ne sert
  plus qu'une fois, et échoue.
