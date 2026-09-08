# Remédiation IDOR `/structure` — impact par rôle et par écran

PR : https://github.com/betagouv/service-national-universel/pull/5292 (HEAD `3acff506d`).
Analyse du 2026-09-08, à partir des consommateurs front (`admin/src`, `app/src`) de chaque route modifiée et des permissions en base (`api/migrations/20250624122150-seed-responsable-permissions.js` et suivantes).

## Résumé

| Rôle | Impact visible | Niveau |
|---|---|---|
| Admin | Aucun (permission `STRUCTURE FULL` sans policy : aucune restriction). Seuls les payloads `/networks` et `/children` sont plus légers. | Nul |
| Référent départemental | Listes de structures limitées à ses départements sur « Mon équipe » et « Utilisateurs » (édition). Ne peut plus rattacher un responsable/superviseur à une structure hors département. Historique d'une structure hors département : 403 (l'onglet n'y mène déjà pas). | Faible, voulu |
| Référent régional | Idem, limité à sa région. | Faible, voulu |
| Référent à `region`/`department` vide | `GET /structure` répond 403 : nom de structure absent sur « Mon équipe », loader infini dans l'édition d'un responsable/superviseur. À mesurer en prod avant déploiement (requêtes ci-dessous). | Bloquant pour ces comptes, à traiter en données |
| Responsable de structure | Aucun changement d'écran : ses pages passent par `GET /structure/:id` (inchangé) ou Elasticsearch (déjà filtré). Le filtre « structure » de la page Utilisateurs ne propose plus que sa structure. Perd seulement ce qu'il ne devait pas voir. | Nul |
| Superviseur (tête de réseau) | Page volontaires : missions du réseau toujours chargées (`/children` sur son propre réseau autorisé). Filtre « structure » de la page Utilisateurs limité à son réseau. Ne peut plus lire l'historique ni les missions/antennes d'un autre réseau (API seulement, aucun écran n'y menait). | Nul |
| Jeunes (app) | Aucun : `GET /structure/:id` inchangé, permission `STRUCTURE_READ` sans policy pour le rôle jeune. | Nul |
| Autres rôles (chef de centre, transporteur, CLE, visiteur, DSNJ, INJEP) | Pas de permission `STRUCTURE READ` : ces routes répondaient déjà 403. | Nul |

## Détail par route et écran

### `GET /structure` (liste) — désormais filtrée par le périmètre

Consommateurs : « Mon équipe » (`admin/src/scenes/team/list.jsx:63`, route `/equipe`, menu « Administrateurs » visible pour les référents dép/rég uniquement) et l'édition d'un utilisateur (`admin/src/scenes/utilisateur/edit/details.jsx:113`, route `/user/:id`, ouverte aux rôles ayant `REFERENT WRITE` : admin, référents, superviseur, responsable sur leur propre structure).

| Rôle | Avant | Après |
|---|---|---|
| Admin | Toutes les structures | Toutes les structures |
| Référent dép. | Toutes les structures (nom affiché pour tout membre d'équipe, sélecteur de structure complet) | Structures de ses départements. Sur « Mon équipe », un responsable rattaché à une structure hors département apparaît sans nom de structure (le code fait `structures.find(...)` puis retombe sur `{}`). Dans l'édition d'un responsable/superviseur, le sélecteur ne propose que le département (lecture seule pour un non-admin de toute façon, `details.jsx:547`). |
| Référent rég. | Idem | Structures de sa région, mêmes effets. |
| Référent à géographie vide | Toutes les structures | **403** (fail-closed). « Mon équipe » : colonnes structure vides. Édition d'un responsable/superviseur : `structures.length === 0` déclenche un `Loader` permanent (`details.jsx:537-541`). |
| Superviseur / Responsable | Toutes les structures (la faille) | Sa structure (+ réseau pour le superviseur). L'édition d'un utilisateur de sa structure affiche bien le nom de la structure. |

### `GET /structure/networks` — projection minimale

Consommateur unique : création de structure (`admin/src/scenes/structure/create.jsx:42`), liste déroulante « réseau d'affiliation », qui n'utilise que `_id` et `name`. Accès : admin, référents dép/rég, superviseur (`STRUCTURE CREATE`). Aucun changement visible. Les coordonnées du représentant des têtes de réseau ne transitent plus.

### `GET /structure/:id/children` — périmètre sur le réseau parent, antennes filtrées par le périmètre, projection minimale

Les antennes renvoyées sont elles aussi filtrées par la policy de l'utilisateur : un référent départemental autorisé sur une tête de réseau de son département ne voit que les antennes de son département.

Consommateur unique : page volontaires du responsable/superviseur (`admin/src/scenes/volontaires-responsible/listV2.jsx:168`), appelée avec `user.structureId` pour le rôle superviseur seulement, et qui n'utilise que `_id`. Le superviseur est autorisé sur son propre réseau : comportement inchangé. Un référent dép/rég ou un responsable ne l'appelle pas depuis un écran.

### `GET /structure/:id/mission` — périmètre sur la structure

Consommateur unique : même page volontaires (`listV2.jsx:157`), appelée avec `user.structureId` puis avec les `_id` des antennes. Responsable : sa structure, autorisé. Superviseur : son réseau et ses antennes (`networkId == structureId`), autorisé. Comportement inchangé. Un `404` remplace le `200 []` sur une structure inconnue : aucun écran ne passe un id inconnu.

### `GET /structure/:id/patches` — droits avant existence, puis périmètre

Consommateur : onglet « Historique » de la fiche structure (`admin/src/scenes/structure/view/historyV2.jsx:25`). L'onglet n'est affiché qu'aux rôles ayant `PATCH READ` (`admin/src/scenes/structure/components/Menu.jsx:14`) : admin, référents dép/rég, transporteur, CLE (migration 916). La fiche elle-même passe par `GET /structure/:id` (inchangé, déjà à périmètre), donc un référent n'atteint jamais l'historique d'une structure hors périmètre par l'interface. Le superviseur possède `USER_HISTORY READ` mais n'a pas l'onglet : la fermeture le concerne uniquement en appel direct de l'API.

### `GET /structure/:id` — inchangé

Utilisé par la fiche structure, les fiches mission, le panneau utilisateur, les contrats, l'app jeune. Déjà protégé par la policy. Des tests de non-régression ont été ajoutés pour le responsable (sa structure → 200, autre → 403).

### apiv2 `POST /structure` — périmètre piloté par l'ACL

Consommateur unique : page « Utilisateurs » (`admin/src/scenes/utilisateur/list.tsx:109`), qui sert à afficher le nom de structure des utilisateurs listés, à alimenter l'export et le filtre « structure ». Accès à la page : admin, référents, superviseur (menu « Utilisateurs »). Le responsable n'a pas l'entrée de menu.

| Rôle | Avant | Après |
|---|---|---|
| Admin | Toutes | Toutes |
| Référent dép. / rég. | Toutes | Son périmètre : les utilisateurs dont la structure est hors périmètre apparaissent sans nom de structure dans la liste et l'export. |
| Superviseur | Toutes | Son réseau (structure + antennes). |
| Référent à géographie vide | Toutes | Liste vide (apiv2 renvoie `[]` quand aucun périmètre n'est exploitable) : la page reste utilisable, sans noms de structure, sans toast ni événement Sentry. |

### `isAuthorized` fail-closed (snu-lib, toutes ressources)

Change seulement le cas où la valeur du référent **et** celle de la ressource sont vides toutes les deux. Concrètement : un référent régional sans `region` ne matche plus une ressource sans `region` ; un superviseur ne matche plus une structure sans `networkId` via la policy réseau (la policy `_id == structureId` continue de couvrir sa propre structure). Aucun écran n'exploitait ce cas ; les suites `structure`, `mission`, `referent` de l'API restent vertes.

## À faire avant déploiement

Compter les référents à géographie vide, seuls comptes réellement affectés :

```js
db.referents.countDocuments({ role: "referent_region", $or: [{ region: { $in: [null, ""] } }, { region: { $exists: false } }] })
db.referents.countDocuments({ role: "referent_department", $or: [{ department: { $in: [null, "", []] } }, { department: { $exists: false } }] })
```

Si le compte est non nul : compléter la géographie de ces comptes (donnée), sans affaiblir le code.

## Points d'attention hors périmètre de la PR

- `details.jsx:537-541` : le `Loader` permanent quand la liste de structures est vide est un défaut front préexistant (déjà déclenché pour un référent dont le département n'a aucune structure). Un état « aucune structure accessible » serait plus juste.
- La liste des structures (`/structure`, `listV3.jsx`) passe par Elasticsearch, déjà filtré par rôle : non concernée.
