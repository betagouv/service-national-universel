# Décommissionnement de l'administration CLE — design

**Date** : 2026-09-21 (révisé le 2026-09-22)
**Base** : `main` @ `1e3c4ef6e`
**Origine** : lot 4 du plan de remédiation de l'audit de sécurité API (C1, H8 → H20, L4)

> Ce document décrit une suppression de code et des correctifs d'autorisation. Il ne reproduit
> aucun détail d'exploitation : les constats sont désignés par leur identifiant, comme le font
> déjà les messages de commit des correctifs précédents (#5306, #5307, #5308) sur ce dépôt public.

## 1. Décision

Le dispositif Classes engagées est arrêté et ses acteurs n'ont plus de compte actif. Mais
**la moitié de la base volontaire est `source=CLE`**, et les données de classes et
d'établissements restent consultées par l'administration centrale et départementale.

On ne supprime donc pas « le code CLE ». On sépare deux choses :

- **L'administration CLE** — créer, modifier, vérifier, désister des classes ; gérer les
  établissements et leurs coordinateurs ; inviter et inscrire des référents CLE ; importer
  l'appel à projet. Plus aucun acteur pour s'en servir. **Supprimée.**
- **La consultation CLE** — lire une classe, un établissement, la liste et les statistiques des
  élèves, exporter. Toujours utilisée par `ADMIN`, `REFERENT_DEPARTMENT` et `REFERENT_REGION`,
  sur la moitié des dossiers volontaires. **Conservée, et corrigée** selon le correctif
  d'origine de l'audit : sérialiseur strict et contrôle de périmètre.

**Les données ne sont pas touchées.** Aucune collection supprimée, aucun document modifié hors
du champ `status` des comptes référents CLE.

Cette révision fait suite à deux faits apportés en cours de cadrage : l'existence de jeunes
`source=CLE`, puis leur proportion. La version initiale du document prévoyait une suppression
intégrale ; elle aurait cassé des usages vivants.

## 2. État des lieux vérifié

Constats établis par lecture du code sur `1e3c4ef6e`.

### 2.1 Les comptes CLE sont déjà désactivés

La migration [`20250804095717-987-desactiver-comptes.js`](../../../api/migrations/20250804095717-987-desactiver-comptes.js)
passe `ADMINISTRATEUR_CLE` et `REFERENT_CLASSE` en `ReferentStatus.INACTIVE`, et `auth.ts` refuse
un compte `INACTIVE` sur les trois portes d'entrée : `signin`
([`auth.ts:418`](../../../api/src/auth.ts)), `signin_token` ([`auth.ts:833`](../../../api/src/auth.ts)),
`refreshToken` ([`auth.ts:853`](../../../api/src/auth.ts)).

**Conséquence** : les constats qui supposent un attaquant connecté **avec un rôle CLE**
(C3, C5, C9, H27, H11, H12, H13) sont déjà fermés en pratique, sous réserve du comptage du §7.1.

La chaîne `referent-signup` ne peut pas rouvrir cette porte : son étape finale
([`referentSignupController.ts:184-222`](../../../api/src/cle/referent/referentSignupController.ts))
n'écrit jamais `status`.

### 2.2 Mais la consultation est ouverte à des rôles actifs

`CLASSE_READ` est accordée à `ADMIN`, `REFERENT_REGION` et `REFERENT_DEPARTMENT` — en plus des
rôles CLE et de `TRANSPORTER`
([`seed-responsable-permissions.js:418`](../../../api/migrations/20250624122150-seed-responsable-permissions.js)).
L'écran `/classes` de `admin` est gardé par cette permission
([`RestrictedRoute.tsx:123`](../../../admin/src/components/layout/RestrictedRoute.tsx)) et
consomme `/elasticsearch/cle/classe/*` et `/cle/etablissement/*`.

En revanche `/mes-eleves` est bien mort : il n'est ouvert qu'à `ADMINISTRATEUR_CLE` et
`REFERENT_CLASSE` ([`RestrictedRoute.tsx:17-24`](../../../admin/src/components/layout/RestrictedRoute.tsx)),
tous `INACTIVE`.

### 2.3 Ce qui reste réellement exposé

1. **La chaîne `/cle/referent-signup`, entièrement publique** — aucun middleware
   d'authentification sur ce routeur. H19 et H20 y vivent, et l'étape finale résout le compte par
   `findOne({ invitationToken })`
   ([`referentSignupController.ts:202`](../../../api/src/cle/referent/referentSignupController.ts))
   **sans filtrer sur le rôle** : la portée dépasse le périmètre CLE. C'est le point le plus urgent.
2. **Les routes CLE derrière une simple authentification référent** — `classeController` monte
   `authMiddleware("referent")` ([`classeController.ts:84`](../../../api/src/cle/classe/classeController.ts))
   sans condition de rôle : C1, H8, H9 sont atteignables par tout référent actif.

## 3. Lot 1a — supprimer l'administration CLE

**Objectif** : retirer l'intégralité des écritures et la chaîne publique d'inscription. Ferme
H8, H10 → H13, H15 → H17, H19, H20.

### 3.1 Routes supprimées

| Routeur | Routes | Constats |
|---|---|---|
| `referent-signup` | **tout le routeur** : `GET /token/:token`, `PUT /request-confirmation-email`, `POST /confirm-email`, `POST /confirm-signup`, `POST /` | H19, H20 |
| `classe` | `POST /:id/certificate/:key`, `POST /`, `PUT /:id`, `PUT /:id/referent`, `PUT /:id/verify`, `DELETE /:id`, `GET /:id/notifyRef` | H8, H10, H11, H12, H13 |
| `etablissement` | `POST /`, `PUT /:id`, `PUT /:id/referents`, `DELETE /:id/referents` | H15, H16 |
| `referent` | `POST /invite-coordonnateur`, `POST /send-invitation-chef-etablissement`, `POST /send-invitation-referent-classe-verifiee`, `POST /delete-old-referent-classe` | H17 |
| `classes` | `PUT /update-referents`, `PUT /update-referents-by-csv` | — |
| `appel-a-projet` | `POST /simulate`, `POST /real` | — |

Les services, validateurs et emails qui ne servent plus qu'à ces routes partent avec elles.
`GET /:id/notifyRef` et `PUT /:id/verify` sont supprimées bien qu'en lecture apparente : elles
déclenchent des envois d'emails vers des référents CLE désactivés.

### 3.2 Habilitations

Retirer `ADMINISTRATEUR_CLE` et `REFERENT_CLASSE` des tableaux d'habilitation et des branches
des helpers `canXxx` de `packages/lib/src/roles.ts`, et des permissions en base via une
**nouvelle migration** — les seeds existants sont déjà appliqués, les modifier ne changerait
rien en production.

La migration procède par `$pull` des deux rôles CLE hors du tableau `roles` de **chaque**
document de permission, et ne supprime un document que si son tableau devient vide. Elle ne
supprime surtout pas les documents eux-mêmes : `CLASSE_READ` porte
`[ADMIN, REFERENT_REGION, REFERENT_DEPARTMENT, ADMINISTRATEUR_CLE, REFERENT_CLASSE, TRANSPORTER]`
([`seed-responsable-permissions.js:418`](../../../api/migrations/20250624122150-seed-responsable-permissions.js)),
et le détruire couperait l'accès des ADMIN et des référents départementaux et régionaux — c'est-à-dire
exactement la consultation que ce document entend préserver.

**Les constantes `ROLES.ADMINISTRATEUR_CLE` et `ROLES.REFERENT_CLASSE` restent définies** :
27 fichiers de `admin`/`app` et 26 fichiers de `api` hors `api/src/cle` les importent. Elles ne
servent plus qu'à désigner des comptes désactivés et des dossiers historiques.

Ajouter une migration de contrôle idempotente, sur le patron de la 987 : forcer `INACTIVE` sur
tout compte portant un rôle CLE, journaliser le nombre de comptes concernés (0 attendu). Peut
être fusionnée avec la précédente.

### 3.3 Front

Supprimer la scène `admin/src/scenes/signup` — elle n'appelle que `/cle/referent-signup` — et
les commandes d'écriture des scènes `classe` et `etablissement` (créer, modifier, vérifier,
désister, réaffecter un référent, inviter un coordinateur). Les vues de liste et de détail
restent.

### 3.4 Critères d'acceptation

- `POST /cle/referent-signup/*` et toutes les routes du tableau §3.1 répondent 404. Le test sur
  la chaîne signup est le plus important : il se fait sans authentification.
- Les routes du §4.1 répondent toujours 200 pour un `ADMIN`.
- `admin` compile et l'écran `/classes` s'affiche, sans les boutons d'écriture.
- La suite de tests `api` passe ; les tests des routes supprimées sont retirés.

## 4. Lot 1b — corriger les lectures conservées

**Objectif** : appliquer aux routes qui restent le correctif d'origine de l'audit. Ferme C1, C3,
H9, H14, H18, L4.

### 4.1 Routes conservées et correctif attendu

> Les constats de cette section sont **encore ouverts** à la date de rédaction. Ce dépôt étant
> public, la nature des données en jeu et le mécanisme de chaque constat ne sont pas décrits ici :
> se reporter au rapport d'audit, qui n'est pas commité. Seuls les identifiants et les routes
> concernées figurent ci-dessous, pour permettre le suivi du chantier.

| Route | Constat |
|---|---|
| `GET /cle/classe/:id` | — |
| `GET /cle/classe/from-etablissement/:id` | **C1** |
| `POST /cle/classe/export` | **H9** |
| `GET /cle/classe/:id/patches` | — |
| `GET /cle/classe/public/:id` | **L4** |
| `GET /cle/etablissement/:id`, `GET /cle/etablissement/from-user` | **H14** |
| `POST /cle/referent/getMany` | **H18** |
| `GET /cle/young/by-classe-stats/:idClasse` et les deux `by-classe-historic/:idClasse/patches*` | — |
| `/elasticsearch/cle/{classe,etablissement,young}` | **C3** (part sérialisation close par #5310) |

Deux correctifs s'appliquent selon les routes : une sérialisation stricte des sorties, et un
contrôle de périmètre départemental ou régional appuyé sur `getPolicyMongoFilter` et sur des
helpers rendus dépendants du document cible, conformément au chantier transverse n°1 de l'audit.
`ADMIN` reste national. Le détail route par route est à établir au moment du correctif, à partir
du rapport.

### 4.2 `GET /cle/classe/public/:id`

Route non authentifiée, consommée par `app/` dans le tunnel volontaire — étape consentements,
contexte représentants légaux, situation scolaire, formulaire de contact. Elle est conservée
dans son principe, et fait l'objet du constat **L4**.

Le correctif consiste à lui ajouter un sérialiseur strict, limité aux champs réellement
consommés par `app/` :

| Champ | Consommateur |
|---|---|
| `_id` | `formatClass` |
| `name`, `coloration`, `grades`, `uniqueKeyAndId` | `MyClass`, `contact.service`, consentements |
| `schoolYear` | situation scolaire |
| `etablissement` → `{ name, schoolYear }` | consentements, situation scolaire |
| `cohortDetails` → `{ dateStart, dateEnd }` | consentements |
| `referents` → `[{ firstName, lastName, fullName }]` | `formatClass` déstructure `referents[0].fullName` |

`fullName` est un virtuel Mongoose ([`api/src/models/referent.ts:23`](../../../api/src/models/referent.ts)) :
le sérialiseur doit le produire explicitement, sans quoi `formatClass` casse côté `app/`.

### 4.3 Critères d'acceptation

- Aucune réponse des routes du §4.1 ne contient `invitationToken`, `forgotPasswordResetToken`,
  `token2FA`, `password` ni les tokens parents — test dédié qui échoue si un champ non listé
  apparaît.
- Un `REFERENT_DEPARTMENT` ne lit une classe, un établissement ou des élèves que dans son
  département ; idem région. Test par rôle.
- `GET /cle/classe/public/:id` ne renvoie que les champs du tableau §4.2.
- Le tunnel volontaire d'un jeune `source=CLE` est parcouru de bout en bout sans régression.

## 5. Lot 2 — code mort résiduel

Beaucoup plus réduit que dans la version initiale du document, puisque la consultation reste.

1. **`admin`** — supprimer la scène `volontaire-cle` (`/mes-eleves`, §2.2) et les entrées de
   navigation réservées aux rôles CLE dans `SideBar` et `RestrictedRoute`.
2. **`api`** — supprimer `api/src/cle/appelAProjetCle`, les services et emails devenus orphelins
   après le lot 1a, et le cron `patch/classePatch.js` s'il ne sert plus qu'à l'administration.
3. **`packages/lib`** — retirer les 7 drapeaux CLE de `featureFlags.ts` devenus sans effet.

Ce qui **ne** part **pas** : `api/src/models/cle`, `api/src/controllers/elasticsearch/cle`, les
routes du §4.1, les scènes `classe` et `etablissement` de `admin`, la scène `cle` de `app`, les
constantes de rôle, et les champs `classeId` / `etablissementId` du modèle `young` avec leur
index ([`young.ts:132`](../../../api/src/models/young.ts)).

## 6. Risques

| Risque | Traitement |
|---|---|
| Un compte CLE est redevenu `ACTIVE` depuis la migration 987 | Comptage §7.1 avant merge ; la migration de contrôle du lot 1a le corrige |
| Un `invitationToken` traîne sur un compte non-CLE, exploitable par la chaîne signup | Fermé par le lot 1a ; vérifier si d'autres routes consomment `invitationToken` |
| Le périmètre du lot 1b coupe l'accès à des référents qui en avaient légitimement besoin | La moitié de la base est CLE : tester par rôle sur des dossiers réels avant merge, et prévoir un retour arrière par la permission plutôt que par le code |
| Une écriture supprimée au lot 1a s'avère encore utilisée | Journaliser le trafic des routes du §3.1 pendant 30 jours **avant** de les supprimer (§7.2) |
| `ClasseStateManager` appelé depuis [`young.ts:74`](../../../api/src/models/young.ts) devient incohérent | Conservé : il recalcule l'état d'une classe au changement de statut d'un jeune, sur la moitié de la base |

## 7. Vérifications en production

À exécuter avant le merge du lot 1a, résultats à consigner dans la PR.

### 7.1 Comptes CLE encore actifs

Compter les documents `referent` dont le `role` vaut `administrateur_cle` ou `referent_classe`
et dont le `status` n'est pas `INACTIVE`. Attendu : 0. Toute valeur non nulle demande à
comprendre par quelle voie le compte a été réactivé avant de poursuivre.

### 7.2 Trafic des routes supprimées

Relever, sur 30 jours de logs d'accès, le trafic de chacune des routes du §3.1. Attendu : nul
hors scanners. Un appel authentifié récent sur une route d'écriture remet en cause son classement
et doit être instruit avant suppression.

### 7.3 Volumétrie de consultation

Nombre de jeunes `source=CLE`, dont ceux dont le statut n'est ni `VALIDATED`, ni `WITHDRAWN`, ni
archivé. Sert à dimensionner les tests du §4.3 et à choisir les dossiers de test réels.

## 8. Hors périmètre

- Toute suppression, purge ou anonymisation de données.
- Les autres lots de l'audit (C2, C6, C26 → C28 déjà traités ; le reste suit son propre plan).
- Les constats portant sur des rôles non-CLE présents dans les mêmes routes ES (`TRANSPORTER`,
  `DSNJ`, `INJEP`) : ils relèvent du chantier transverse n°1, pas de ce document.
- `apiv2` : les 57 fichiers référençant un rôle CLE ou `classeId` ne sont pas touchés, la
  consultation y restant nécessaire.
