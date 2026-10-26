# Lot V14 : cloisonnement croisé département/région sur les programmes (GOO-159 : M26)

Périmètre : `packages/lib/src/roles.ts` (`canCreateOrUpdateProgram`) et `api/src/__tests__/program-security.test.ts`.

## 1. Corrigé

| Surface | Correctif |
| --- | --- |
| `POST /program`, `PUT /program/:id`, `DELETE /program/:id` (tous passent par `canCreateOrUpdateProgram`) | Chaque territoire contraint désormais les deux champs : un référent départemental ne peut plus poser qu'une region cohérente avec son département (celle de `department2region`, ou vide) ; un référent régional ne peut plus poser qu'un department réellement situé dans sa région (via `region2department`, ou vide). Avant ce correctif, chaque rôle ne contrôlait que son propre champ et laissait l'autre libre. |

`GET /program` filtre déjà par `$or` sur `department`/`region`/`visibility` national : un programme mal cloisonné (region ou department étranger) y apparaissait donc dans un territoire qui n'était pas le sien. Ce correctif empêche de créer ou de faire glisser un programme dans cet état.

## 2. Choix

- **Réutiliser `department2region`/`region2department`** (déjà présentes dans `region-and-departments.ts`, et `region2department` déjà utilisée ailleurs dans `roles.ts` pour un cloisonnement équivalent) plutôt qu'introduire une nouvelle notion de territoire.
- **Champ vide toujours accepté** (`program.region` vide pour un départemental, `program.department` vide pour un régional) : couvre les programmes historiques sans visibilité fine et les programmes de visibilité REGION/NATIONAL qui ne portent pas de department.

## 3. Effet visible

Pour un utilisateur déjà dans son périmètre : aucun changement, un référent qui pose la région exacte de son département (ou un département réel de sa région) continue à recevoir 200.

Pour un utilisateur qui posait déjà un territoire incohérent : la création ou la modification qui l'aurait produit renvoie désormais 403 au lieu de 200 — c'est l'objet du correctif.

**Décision à valider par Philippe** : les programmes déjà enregistrés en base avec un couple department/region incohérent (créés avant ce correctif) ne sont plus modifiables ni supprimables par leur référent territorial une fois ce correctif déployé — le contrôle porte aussi sur le programme stocké (`PUT`, premier contrôle ; `DELETE`). Seul un administrateur peut encore les corriger ou les supprimer. Faut-il un inventaire ou une migration de ces fiches avant déploiement ?

## 4. Hors périmètre

- `GET /program/:id` (lecture par id, sans filtre géographique) et `packages/lib/src/roles.ts:225` (accès sans `?.` sur `region2department`) : préexistants, non modifiés par ce correctif — consignés sur GOO-188.
