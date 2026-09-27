# Lot P19 — snupport-api : administration de la base de connaissance et ventilation

Audit de sécurité de la production du 25/09/2026, constats PM44, PM47, PL18, PL19 et PL22
(ticket Linear GOO-77). Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main`.

PM54 (éditeur de ticket, image collée sans balise `<img>` à la désérialisation), mentionné dans le
brouillon initial du lot, est traité séparément par le lot P33 (GOO-84) — non repris ici.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PM44 | moyenne | `POST /kb-search`, `GET /feedback`, `PUT /feedback/archivefeedbacks`, `GET /feedback/usefulArticles`, `POST /knowledge-base/all` (snupport-api) | ces cinq routes n'exigeaient qu'un agent authentifié (`agentGuard`) — un référent SNU synchronisé consultait ou administrait les écrans internes de la base de connaissance et du feedback. `requireRole("AGENT")` ajouté aux quatre premières ; `knowledgeBaseEditorGuard` (déjà posé sur les autres routes d'écriture du fichier) ajouté à `POST /all` |
| PM47 | moyenne | `POST /ventilation` (création), et exécution automatique de toute règle par `matchVentilationRule` (`POST /v0/message`, IMAP, `POST /ticket`, `PATCH /ticket/:id`, `POST /message`) | la création d'une règle est réservée à `AGENT` ; une règle de référent (région/département) n'entre plus dans la requête de sélection pour un ticket hors de son périmètre de lecture (`formSubjectStep1 !== "QUESTION"`, même règle que `ticketScope.js`) ; une règle qui pointe un agent supprimé/inexistant ne fait plus planter le traitement (`setAgent` renvoie le ticket inchangé au lieu de laisser une `TypeError` non rattrapée) |
| PL18 | faible | `GET /knowledge-base/sitemap` (snupport-api, anonyme) | le plan du site ne renvoie plus que les sections marquées `allowedRoles: "public"` — les titres/slugs des rubriques réservées (référent, admin…) n'apparaissent plus dans la réponse anonyme ni dans le HTML statique généré pour la KB publique |
| PL19 | faible | `GET /knowledge-base/:allowedRole/search` (snupport-api) | le champ `search` est borné à 128 caractères (`Joi.string().max(128)`), comme sur `POST /kb-search` |
| PL22 | faible | `GET /ventilation`, `PATCH /ventilation/:id`, `DELETE /ventilation/:id` (snupport-api) | le support central (`AGENT`, et `DG` en lecture) retrouve la supervision des règles de référent : lecture de toutes les règles, désactivation (`{active:false}` seul) et suppression, sans pouvoir réécrire le contenu d'une règle qui ne lui appartient pas |

## 2. Choix

- **`POST /kb-search`, `POST /ventilation` et les 3 routes agent-facing de `feedback.js` réservées à
  `AGENT`, pas seulement « un agent »** : ces écrans (recherches internes, feedback, création de
  règle de ventilation) sont déjà masqués côté UI pour tout autre rôle
  (`setting/index.jsx`) ; c'est un durcissement backend pur, sans changement front.
- **Le verrou de création sur `POST /ventilation` est une régression de comportement
  volontaire** : un référent pouvait auparavant créer sa propre règle scopée. Aucun usage légitime
  ne passe par l'UI pour ce rôle (l'écran de ventilation est réservé à `AGENT`), donc pas d'impact
  réel — mais c'est un vrai changement de contrat, pas seulement un bouchage de trou.
- **La supervision centrale (PL22) est codée localement dans `ventilation.js`**, avec une fonction
  `isCentralSupport` propre au contrôleur, plutôt qu'en modifiant `ownedResourceScope.js` — ce
  module est partagé avec `folder.js` (3 usages) dont le cloisonnement strict actuel ne devait pas
  changer.
- **`PATCH` laisse `AGENT` neutraliser une règle de référent, jamais la réécrire** : le bypass ne
  s'applique que si le corps de la requête est exactement `{active: false}`
  (`Object.keys(body).length === 1`) ; tout autre champ retombe sur le périmètre par propriétaire
  habituel (`canManageOwnedResource`). `DELETE` reste un bypass total pour `AGENT` : supprimer une
  règle ne permet pas d'en falsifier le contenu.
- **`DG` voit toutes les règles (`GET`) mais ne bénéficie d'aucun bypass en écriture** :
  `isCentralSupport` (lecture) et le bypass `PATCH`/`DELETE` (écriture, réservé à `req.user.role
  === "AGENT"`) sont deux vérifications distinctes, pour ne pas donner à un rôle jusqu'ici jamais
  cité comme propriétaire de règle (`DG` est absent de l'enum `userRole` du modèle) un pouvoir de
  modification qu'il n'avait pas.
- **Le filtre `$or` de `matchVentilationRule` exclut entièrement les branches référent
  (région/département) pour un ticket hors périmètre**, plutôt que d'ajouter un champ
  `formSubjectStep1` à la requête Mongo sur `VentilationModel` : ce champ vit sur le ticket, pas sur
  la règle — l'ajouter tel quel à la requête aurait fait disparaître silencieusement toute règle de
  référent, y compris sur les tickets `QUESTION` qu'elle doit continuer à traiter.
- **`setAgent` renvoie le ticket inchangé (pas une erreur) quand l'agent n'existe plus**, et son
  `catch` fait de même par défense en profondeur : la cause exacte du blocage (confirmée en lecture
  de code) était `agent.firstName` sur un `agent` `null`, rattrapé par un `catch` qui ne renvoyait
  rien (`undefined`), puis déréférencé deux fois de suite plus haut dans
  `matchVentilationRule` (une fois pour journaliser la règle appliquée, une seconde fois dans le
  `catch` englobant qui journalise l'erreur elle-même). Les deux points de déréférencement de
  `ticket` dans `matchVentilationRule` sont maintenant gardés (`if (ticket) ...`).

## 3. Impact fonctionnel

- Un référent départemental ou régional synchronisé ne voit plus l'historique des recherches
  internes de la KB (`kb-search`), les écrans de feedback/commentaires, l'arbre complet de la base
  (`POST /all`), ni les règles de ventilation d'un autre propriétaire ; il ne peut plus créer de
  règle de ventilation. Aucun de ces écrans ne lui était accessible côté interface avant ce lot.
- Un anonyme consultant le plan du site de la base de connaissance publique ne voit plus les
  titres/slugs des rubriques réservées (référent, admin…), seulement les sections publiques.
- Une règle de ventilation de référent ne s'applique plus aux tickets `TECHNICAL` (ou tout autre
  sujet hors `QUESTION`) hors de son périmètre de lecture habituel.
- Une règle de ventilation pointant un agent supprimé n'interrompt plus le traitement d'un message
  entrant (formulaire, IMAP, réponse ticket) : le ticket continue son traitement normal, sans les
  champs `agentFirstName`/`agentLastName`/`agentEmail` renseignés pour cette règle précise.
- Le support central (`AGENT`) retrouve la capacité de désactiver ou supprimer une règle de
  référent problématique (boucle, ciblage erroné) sans devoir passer par la base de données ; `DG`
  retrouve la visibilité en lecture sur l'ensemble des règles.

## 4. Tâches post-déploiement

- Déploiement : `snupport-api` seul.
- Aucune migration, aucune variable d'environnement nouvelle.
- Suggéré par l'audit (hors du strict périmètre de ce lot, à faire si souhaité) :
  - Purger ou auditer les règles de ventilation `userRole !== "AGENT"` créées avant ce correctif :
    elles restent valides (aucune régression sur les règles existantes), mais toute nouvelle
    création par un référent est désormais refusée — vérifier qu'aucune automatisation externe n'en
    dépendait.
  - Mesurer les entrées d'erreur dans `logVentilation` (règles qui échouaient silencieusement,
    notamment sur un `agentId` obsolète) pour identifier les règles à nettoyer côté métier.
  - Purger la collection `kbsearch` ou lui poser un TTL si elle est volumineuse (recherches
    anonymes non bornées avant ce lot, cf. lot P18 déjà livré pour le rate-limit des routes
    d'authentification — ce lot ne traite que la taille de la requête, pas le volume de la
    collection).
  - Hors constat, signalé par l'audit : le même champ de recherche sans borne existe côté `api`
    (`GET /SNUpport/knowledgeBase/search`) — à traiter dans un lot séparé si souhaité (P12/GOO-74).
