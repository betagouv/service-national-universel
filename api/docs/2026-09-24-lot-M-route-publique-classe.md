# Lot M — CLE : route publique de classe (L4)

Date : 2026-09-24 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-39 · Branche `fix/goo-39-lot-m-classe-publique`, base `origin/main` (`1eceec3a9`)

## État du constat sur `origin/main`

| Id | Déjà corrigé | Restait ouvert |
|---|---|---|
| L4 | #5350 projetait les documents peuplés (`referents` → nom/prénom, `etablissement` → nom/année scolaire, `cohortDetails` → dates) | la **racine** du document classe partait entière, sans authentification : `referentClasseIds`, `etablissementId`, `sessionId`, `cohesionCenterId`, `ligneId`, `pointDeRassemblementId`, effectifs, statut de validation, métadonnées… Une classe inconnue répondait 200 avec `data: null` |

## Pourquoi la route n'est pas supprimée

Elle a encore trois appelants dans `app` (via `useClass`) :

- `scenes/contact/components/PublicContactForm.jsx` — formulaire de contact **non authentifié**
  (question « HTS_TO_CLE » : nom de classe, `uniqueKeyAndId`, nom de l'établissement) ;
- `scenes/account/scenes/school-situation` — page « Ma situation scolaire » du volontaire
  (nom, niveaux, coloration, établissement et sa commune) ;
- `scenes/cle/OnBoarding.tsx` — page d'accueil du lien d'inscription par classe (statut, référent,
  dates de séjour). Les inscriptions sont fermées (#5358) mais la page reste routée.

La supprimer casserait les deux premiers usages ; on applique la projection explicite prévue par le ticket.

## Ce qui change

| Avant | Après |
|---|---|
| document classe complet + virtuals peuplés | objet construit champ par champ : `_id`, `id`, `name`, `uniqueKeyAndId`, `coloration`, `grades`, `status`, `cohort` ; avec détails : `referents` (`_id`, `id`, `firstName`, `lastName`, `fullName`), `etablissement` (`name`, `city`), `cohortDetails` (`dateStart`, `dateEnd`) |
| classe inconnue → 200 `data: null` | 404 |

`referentClasseIds` et `etablissementId` sont lus pour peupler les virtuals mais ne sont plus renvoyés.
`etablissement.city` est ajouté : la page « Ma situation scolaire » l'affichait déjà et recevait `undefined` depuis #5350.

L'équivalent apiv2 (`/v2/classe/public/:id`, L41) a été supprimé par le lot N1 (#5382).

## Démonstration

`api/src/__tests__/cle-perimetre-security.test.ts`, bloc « L4 » :

- racine projetée (aucune clé hors liste blanche) avec et sans `withDetails` ;
- établissement limité à `name` et `city` (`schoolYear` n'existe pas sur le modèle) ;
- classe inconnue → 404.

Contre-épreuve faite : sur le code de `origin/main`, les trois nouveaux tests échouent.
Fichier complet : 23 tests verts (Node 20, transpilation seule en local).
