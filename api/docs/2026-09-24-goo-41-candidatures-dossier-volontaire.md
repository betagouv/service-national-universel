# GOO-41 — candidatures hors périmètre dans le dossier volontaire

Constat de recette superviseur sur la CI (24/09), hors audit du 21/09. Vérifié et corrigé le
2026-09-24 sur `origin/main` @ `3355b4c85` (ticket Linear GOO-41).

## 1. Constats et correctifs

| Route | Défaut | Correctif |
| --- | --- | --- |
| `GET /referent/young/:id` | l'accès au dossier était borné (#5342), mais la réponse joignait **toutes** les candidatures du volontaire, chacune avec la structure complète, `structureManager` (nom, e-mail, mobile) compris | responsable / superviseur : seules les candidatures de sa structure (et de son réseau pour un superviseur) sont jointes. `structureManager` n'est plus joint, quel que soit le rôle |
| `GET /young/:id/application` | `CANDIDATURE_READ` est seedée sans policy : `isReadAuthorized` acceptait **n'importe quel volontaire** pour un responsable, un superviseur ou un référent hors territoire, et la liste n'était pas filtrée | même contrôle de périmètre que le dossier (`canViewYoungFileInScope`), puis même filtre sur les candidatures pour un responsable / superviseur |

Le filtre vit dans `getApplicationScopeFilter` (`api/src/young/youngScope.ts`) et reprend le
découpage de `getActorStructureIds`, déjà utilisé pour ouvrir le dossier.

## 2. Choix

- **Référents départementaux / régionaux, chefs de centre, référents CLE, admin** : pas de filtre sur
  les candidatures. Ils voient le dossier au titre de leur territoire ou de leur rattachement, et toutes
  les candidatures du volontaire en relèvent.
- **`structureManager` retiré de la jointure, pas du sérialiseur** : `GET /structure/:id` doit toujours
  le renvoyer à la structure elle-même (page d'édition). Aucun écran ne l'affiche depuis la candidature :
  le panneau volontaire n'utilise que `structure.name`.
- **Front non modifié** : les écrans responsable (`admin/src/scenes/volontaires-responsible/*`)
  n'utilisent pas `young.applications`.

## 3. Tests

`api/src/__tests__/young-applications-scope.test.ts` : superviseur (réseau seul, sans
`structureManager`), responsable (sa structure seule), responsable sans candidature chez lui (403),
référent départemental hors territoire (403) et du territoire (toutes les candidatures).

## 4. Hors périmètre

- Les autres lectures de candidatures par volontaire (`applicationController`, `utils/index.ts`,
  crons) sont internes (calculs de rang, de statut) et ne renvoient pas la liste au client.
- Les exports Elasticsearch des candidatures sont cloisonnés par le lot L4 (GOO-33).
