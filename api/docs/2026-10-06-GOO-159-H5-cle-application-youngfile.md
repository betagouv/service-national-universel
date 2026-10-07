# H5 — clé « application » sur GET /referent/youngFile/:youngId/:key/:fileName

Date : 2026-10-06 · Lot V14 (GOO-159), constat H5 · Base `origin/main` (`5f47d2cad`)

## Ce qui a été vérifié

| Constat | Où | Avant | Après |
|---|---|---|---|
| H5 | `api` `GET /referent/youngFile/:youngId/:key/:fileName` | un responsable/superviseur pouvait viser une pièce de candidature via cette route, hors du périmètre de la route dédiée | déjà corrigé par le lot PH20/H65 (`#5460`) : `key` est borné à `FILE_KEYS` + `MILITARY_FILE_KEYS` (`api/src/referent/referentController.ts:1012-1014`) et `fileName` à un seul niveau de chemin (`safePathSegment()`) ; aucune des deux valeurs n'accepte la variante visant une candidature |

Pas de code applicatif modifié : ce lot ajoute la non-régression manquante pour cette variante précise,
absente des tests du lot PH20/H65 (`referent-young-file-path.test.ts`).

## Tests ajoutés (`api/src/__tests__/referent-young-file-path.test.ts`)

- `BAD_KEYS` : nouvelle entrée `"application"` → hérite des deux tests paramétrés existants
  (responsable en périmètre, administrateur).
- Test dédié : clé `application` suivie d'un nom de fichier à plusieurs niveaux visant une candidature
  d'une **autre structure** que celle du responsable → 400, stockage non appelé.

## Mutation (rule 13)

| Mutation | Résultat |
|---|---|
| `key` : ajout de `"application"` à la liste autorisée (une ligne) | les 2 tests `BAD_KEYS` passent au rouge ; le test dédié reste vert (seconde barrière intacte) |
| `fileName` : `safePathSegment()` → `Joi.string()` (une ligne) | les 3 tests restent verts (première barrière intacte) |
| Les deux mutations combinées (état antérieur à PH20) | les 3 tests passent au rouge |

Confirme une défense en profondeur : les deux contrôles (clé et nom de fichier) bloquent chacun
indépendamment cette variante ; le test dédié ne tourne au rouge que si les deux sont cassés ensemble.
Mutations annulées (`git checkout --`) avant commit.

## Vérification (Node 20)

| Contrôle | Résultat |
|---|---|
| `api` — `referent-young-file-path.test.ts` (ts-jest, `--maxWorkers=1`) | 146/146 passés |

## Restant sur GOO-159 (lot V14)

PM13, PM23.
