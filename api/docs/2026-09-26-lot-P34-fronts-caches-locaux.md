# Lot P34 — Fronts : caches locaux (react-query, aperçus de tickets)

Audit de sécurité de la production du 25/09/2026, constats PM55 et PL24 (ticket Linear GOO-85).
Vérifiés ouverts puis corrigés le 2026-09-26 sur `origin/main`.

## 1. Correctifs

| Constat | Sévérité | Surface | Correctif |
| --- | --- | --- | --- |
| PM55 | moyenne | snupport-app : aperçus de tickets persistés par redux-persist (`localStorage`, clé `persist:root`) | le cache ne garde plus que les aperçus **ouverts**, réduits à `_id`, `status` et `contactGroup` (`toPersistedTicketPreview`, `snupport-app/src/utils/ticketPreviewCache.js`). Le document ticket complet (fil `textMessage`, notes internes, `messageDraft`, identité et attributs du contact), les étiquettes, les messages et la signature ne sont plus écrits sur le disque ; ils sont rechargés depuis l'API à l'affichage de l'aperçu |
| PL24 | faible | app (moncompte) : cache react-query conservé après déconnexion sans rechargement | `queryClient.clear()` dans les quatre chemins de déconnexion (menu utilisateur, carte utilisateur, page de non-éligibilité, `useAuth`) ; les clés `application`, `equivalence` et `ticketsInfo` portent désormais l'identifiant du volontaire (`{ youngId }`) |

## 2. Choix

- **Liste de champs plutôt que liste d'exclusions** (PM55) : le correctif FM21 retirait `messages`
  et `signature` de chaque aperçu mais laissait passer le document `ticket` brut sous une autre clé.
  La fonction de persistance énumère désormais ce qu'elle garde : un champ ajouté plus tard au
  modèle ticket n'est pas persisté par défaut.
- **Élagage par `openTicketIds`** : les tickets fermés ou sortis des aperçus ouverts ne
  s'accumulent plus dans le cache d'une session à l'autre. L'état en mémoire (liste « Tickets
  affichés » pendant la session) est inchangé ; seul ce qui est écrit sur le disque est réduit.
- **Transform appliqué dans les deux sens** (écriture et réhydratation) et **version du cache
  portée à 2** : un cache écrit par une version précédente, qui contient des documents complets,
  est écarté au démarrage puis réécrit sous la forme réduite.
- **Aperçu réhydraté affiché en « Chargement… »** jusqu'au retour de `GET /ticket/:id`
  (`isTicketPreviewLoaded` : les étiquettes, jamais persistées, ne reviennent qu'avec ce fetch).
  `Thread` initialise son état (brouillon, destinataire) une seule fois au montage : il ne doit
  pas être monté sur un ticket partiel.
- **Correction d'un appel `updateTicket` sans identifiant** pour les rôles autres qu'AGENT dans
  `TicketPreview.getData()` : l'appel ne mettait rien à jour. Il passait inaperçu tant que le
  cache contenait le ticket complet ; sans ce correctif, l'aperçu réhydraté d'un référent
  resterait en chargement.
- **Clés react-query sous forme d'objet** (`["equivalence", { youngId }]`) : les invalidations par
  préfixe existantes (`["equivalence"]` dans `EditEquivalence`) continuent de viser la liste, et la
  clé ne se confond pas avec `["equivalence", id]` (une équivalence précise).
- **Pas de rechargement complet de la page à la déconnexion** : vider le cache suffit et garde le
  message « Vous avez bien été déconnecté ». Une requête react-query en échec d'authentification
  recharge déjà la page vers `/auth`.

## 3. Impact fonctionnel

- snupport-app : après un rechargement de la page, la liste « Tickets affichés » ne reprend que
  les aperçus qui étaient ouverts ; chacun affiche brièvement « Chargement… » avant ses données.
  Les tickets seulement listés doivent être réajoutés depuis la liste des tickets.
- app : après une déconnexion, les pages Phase 2 et le badge « Mes échanges » refont leurs appels
  à la connexion suivante au lieu de réutiliser le cache.

## 4. Tâches post-déploiement

- Déploiement : app et snupport-app, indépendants, sans migration ni variable.
- Aucune action sur les postes : le premier chargement de snupport-app après déploiement écarte
  l'ancien cache (version 1) et le remplace par la forme réduite.
