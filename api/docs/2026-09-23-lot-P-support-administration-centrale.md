# Lot P — support : administration réservée au support central (M84, M89, M90, M95, M96, L51)

Date : 2026-09-23 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-26 · Branche `fix/goo-26-lot-P-support-administration`, base `origin/main` (`68e7252c4`)

## Contexte

Dans snupport-api, les objets d'administration du support (dossiers de tickets, règles de ventilation
exécutées automatiquement, étiquettes, modules de texte) étaient modifiables et supprimables par
**tout agent authentifié**, y compris les référents support départementaux et régionaux provisionnés
en masse par le cron `syncReferentSupport`. Les recherches d'auto-complétion construisaient par
ailleurs un `$regex` à partir de la saisie brute.

Le correctif suit le schéma déjà appliqué par #5317 (base de connaissance), #5319 (comptes agents) et
#5321 (modèles de tickets) : réserver l'administration au support central (`AGENT`), et cloisonner les
objets à propriétaire (dossiers, ventilations) au périmètre de leur créateur.

## État des constats sur `origin/main`

Chaque constat a été relu sur le code courant avant correction.

| Id | Déjà corrigé | Restait ouvert |
|---|---|---|
| M89 | modules de texte : PATCH/DELETE déjà cloisonnés par `canManageShortcut` (GOO-6 / FH12, `shortcut.routes.test.js`) | seule la recherche restait vulnérable (L51) |
| M95 | base de connaissance en écriture (`knowledgeBaseEditorGuard`, #5317), administration des comptes agents (#5319), modèles de tickets (#5321) | ventilations, dossiers, étiquettes ; `kb-search`, `shortcut/search`, `tag/search` (L51) |
| M84, M90, M96, L51 | — | ouverts |

`GET /agent` (annuaire des comptes) reste lisible par tout agent : il alimente l'attribution de
tickets côté référents. Le restreindre demande une vérification côté front ; ce n'est pas repris ici
(voir « Hors périmètre »).

Les référents ne pouvant pas porter le rôle `ADMIN` (supprimé par #5319), la hiérarchie
« ADMIN pour l'administration » de l'audit se lit « `AGENT` central » sur le code courant.

## Ce qui change

| Id | Route | Avant | Après |
|---|---|---|---|
| M96 | `POST /ventilation` | `userRole` forcé, mais pas le territoire | `userRole` **et** `userDepartment`/`userRegion` forcés côté serveur pour les référents |
| M96 | `GET /ventilation` | `find({})` — toutes les règles | filtré au périmètre de l'appelant (`scopeOwnedResourceQuery`) : un agent ne voit que les règles centrales, un référent que les siennes |
| M96 | `PATCH`, `DELETE /ventilation/:id` | aucune vérification | `findById` → 404 si absente, `canManageOwnedResource` → 403 hors périmètre ; un référent ne touche jamais une règle centrale (`AGENT`) |
| M84 | `PATCH`, `DELETE /folder/:id` | aucune vérification | `findById` → 404, `canManageOwnedResource` → 403 hors périmètre |
| M84 | `POST /folder/reindex` | réordonnait tous les dossiers ; `forEach(async …)` ne renvoyait aucune promesse (réponse avant la fin des écritures) | ne réindexe que les dossiers du périmètre de l'appelant (les autres ids sont ignorés) ; écritures attendues via `Promise.all` |
| M90 | `PATCH /tag/:id`, `PUT /tag/soft-delete/:id` | ouverts à tout agent | `requireRole("AGENT")`, comme la création |
| M90 | `DELETE /tag/:id` (suppression définitive) | supprimait n'importe quelle étiquette | **route retirée** ; seule la suppression logique subsiste, elle préserve l'historique des tickets étiquetés |
| L51 | `GET`+`POST /shortcut/search`, `GET /tag/search`, `POST /kb-search` | `$regex` alimenté par la saisie brute (injection NoSQL, ReDoS) | motif échappé (`escape-string-regexp`), tolérant aux diacritiques et ancré (`utils/searchRegex.autocompleteRegex`, même traitement qu'`autocomplete_regex` de `contact.ts`/`ticket.ts`) ; saisie bornée à 128 caractères |
| — | `POST /kb-search` | `console.log(query)` à chaque requête | retiré |

Le périmètre commun aux objets à propriétaire (dossiers, ventilations) est factorisé dans
`utils/ownedResourceScope.js` (`canManageOwnedResource`, `scopeOwnedResourceQuery`), calqué sur
`canManageShortcut` de `shortcutScope.js`. La règle échoue fermée : rôle inconnu ou objet dont le
rôle ne correspond pas à l'appelant ⇒ jamais administrable.

## Démonstration

34 tests ajoutés dans snupport-api :

- `ownedResourceScope.test.js` — périmètre AGENT / référent, échec fermé (M84, M96) ;
- `searchRegex.test.js` — `.*` traité comme littéral, motif catastrophique neutralisé, ancrage,
  tolérance aux diacritiques (L51) ;
- `folder.routes.test.js` — référent bloqué en PATCH/DELETE d'un dossier central (403), reindex
  limité au périmètre et attendu (M84) ;
- `ventilation.routes.test.js` — GET cloisonné, POST forçant rôle+territoire, PATCH/DELETE bloqués
  hors périmètre (M95, M96) ;
- `tag.routes.test.js` — référent bloqué en modification et suppression logique (403), route de
  suppression définitive absente (404), recherche échappée (M90, L51).

## Vérification (Node 20, en série)

| Contrôle | Résultat |
|---|---|
| `snupport-api` — 5 suites du lot | 34/34 |
| `snupport-api` — suites voisines (`shortcut.routes`, `shortcutScope`, `macro.scope`, `templateRouteGuards`) | 29/29 |
| `snupport-api` — suite complète | 39 suites, 346/346 |

snupport-api n'a toujours pas de job de test en CI : ces tests ne tournent qu'en local.

## Changements de comportement à connaître

- **Référents** : ne peuvent plus modifier, réordonner ni supprimer les dossiers, règles de
  ventilation, étiquettes et modules de texte centraux (`AGENT`). Ils continuent d'administrer leurs
  propres dossiers et règles.
- **Référents** : `GET /ventilation` ne renvoie plus que leurs propres règles.
- **Étiquettes** : leur modification et leur suppression logique sont réservées aux agents centraux ;
  la suppression définitive n'existe plus (soft-delete uniquement).
- **Recherches** : `shortcut/search` et `tag/search` sont désormais des recherches **par préfixe**
  (motif ancré), tolérantes aux accents ; la saisie est plafonnée à 128 caractères.

## Hors périmètre

- `GET /agent` (annuaire des comptes du support) reste lisible par les référents : il sert
  l'attribution de tickets. Le cloisonner suppose de confirmer que le front référent n'en dépend pas.
- Les objets déjà créés sans `userDepartment` par un référent départemental restent gérables par tout
  référent départemental (comportement historique conservé, cf. `shortcutScope.js`).
