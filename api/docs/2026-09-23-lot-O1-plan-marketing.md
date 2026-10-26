# Lot O1 — apiv2 : listes de diffusion et import plan marketing (M81, M82)

Date : 2026-09-23 · Audit sécurité du 21/09/2026 · Ticket Linear GOO-28 · Branche `fix/goo-28-lot-o1-plan-marketing`, base `origin/main` (`032f6173c`)

## Contexte

Les listes de diffusion du plan marketing portent le ciblage des campagnes emailing : leurs
`filters` sont relus tels quels au moment de l'envoi (y compris des campagnes programmées par le
cron) et deviennent une requête Elasticsearch sur l'index `young`. La route d'import dépréciée
`POST /v2/plan-marketing/liste-diffusion` lit un fichier du bucket et l'envoie à Brevo.

## État des constats sur `origin/main`

| Id | Déjà corrigé | Restait ouvert |
|---|---|---|
| M81 | `ListeDiffusionController` réservé aux super-administrateurs (`SuperAdminGuard`, #5352 / H76) | `filters` validé par un simple `@IsObject()` : clés et valeurs libres |
| M82 | — | route ouverte à tout ADMIN (`AdminGuard`), `pathFile` libre dans le bucket |

## Ce qui change

| Id | Route | Avant | Après |
|---|---|---|---|
| M81 | `POST /v2/liste-diffusion`, `PUT /v2/liste-diffusion/:id` | `filters` : objet quelconque (n'importe quel champ ES, valeurs non textuelles) | clés limitées aux filtres proposés par l'admin (`LISTE_DIFFUSION_FILTER_KEYS`, union de `getFilterArray` et `getInscriptionFilterArray`), valeurs `string[]` ; sinon 400 |
| M82 | `POST /v2/plan-marketing/liste-diffusion` | `AdminGuard`, `pathFile` libre | `SuperAdminGuard` (comme l'upload api v1 `POST /plan-marketing/import` qui dépose le CSV) ; `pathFile` doit être `plan-marketing/<nom>.csv` (`[A-Za-z0-9_-]`, pas de sous-dossier ni `..`) ; sinon 400 |

La route M82 n'est **pas supprimée** : elle sert encore l'export Brevo des listes Volontaires et
Inscriptions (`admin/src/hooks/useBrevoExport.ts`), réservé aux super-administrateurs côté front. Le
motif de chemin correspond exactement aux noms produits par `generateCsvBuffer` (snu-lib).

## Démonstration

`apiv2/test/plan-marketing/` :

- `ListeDiffusion.controller.spec.ts` — filtres de l'admin acceptés (201) ; clé inconnue
  (`password`), champ ES arbitraire (`email.keyword`), valeur non liste, valeur objet (`$ne`) → 400
  à la création, clé inconnue → 400 à la modification ;
- `PlanMarketing.controller.spec.ts` — ADMIN non super-admin, référent, responsable → 403 ;
  super-admin avec un CSV d'import → 201 ; chemin hors dossier, traversée `..`, sous-dossier,
  extension autre que `.csv`, retour à la ligne → 400.

Sur le code d'avant, 13 de ces tests échouent.

## Hors périmètre / à surveiller

- Les listes déjà enregistrées ne sont pas re-validées à l'envoi : ignorer une clé inconnue
  élargirait l'audience, la rejeter bloquerait l'envoi. Une liste existante qui porterait une clé
  hors liste devra être corrigée à sa prochaine modification (400 sinon). Contrôle prod suggéré :
  lister les clés distinctes de `listediffusions.filters`.
- Toute nouvelle colonne de filtre ajoutée aux listes Volontaires / Inscriptions de l'admin doit
  être reportée dans `LISTE_DIFFUSION_FILTER_KEYS`.
