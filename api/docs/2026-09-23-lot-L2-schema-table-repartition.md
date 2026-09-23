# Lot L2 — retrait du schéma et de la table de répartition (M23, M24, M25, L18, L19 ; M30)

Audit du 2026-09-21. Vérifié et corrigé le 2026-09-23 sur `origin/main` @ `c6898a311`
(branche `feat/remove-schema-table-repartition-4176a4`).

## 1. Constat

Les écrans admin du schéma de répartition (`/schema-repartition`) et de la table de répartition
(`/table-repartition`) ne sont plus routés dans `admin/src/app.tsx` depuis le décommissionnement
#5214. Les routes API correspondantes restaient montées, et c'est sur elles que portaient les six
constats : contrôles limités au rôle, sans rapprochement de la région ou du département de
l'utilisateur, et, pour certaines lectures, aucun contrôle de rôle.

Aucun front n'appelant plus ces routes, le correctif retenu est la **suppression**, pas le
cloisonnement.

| Id | Routes concernées | Correctif |
| --- | --- | --- |
| M23 | synthèses `GET /schema-de-repartition/…`, `POST /schema-de-repartition/get-group-detail` | routeur démonté |
| M24 | `POST`, `PUT /:id`, `DELETE /:id` sur `/schema-de-repartition` | routeur démonté |
| M25 | `POST /table-de-repartition/{region,department}` et `/delete/{region,department}` | routeur démonté |
| L18 | `GET /schema-de-repartition/export/…`, `/centers/…`, `/pdr/…` | routeur démonté |
| L19 | filtre texte de `/centers/…` et `/pdr/…` | routeur démonté |
| M30 | `GET /session-phase1/:id/schema-repartition` | route supprimée |

## 2. Ce qui est retiré

### api

- `routes.ts` : montages `/schema-de-repartition` (13 routes) et `/table-de-repartition` (7 routes).
- `controllers/planDeTransport/schema-de-repartition.ts` et `table-de-repartition.ts`.
- `controllers/session-phase1.ts` : la route `GET /:id/schema-repartition` et l'import de
  `SchemaDeRepartitionModel`, devenu inutile.
- `controllers/planDeTransport/commons.js` : la constante `filteredRegionList`, qui n'avait plus
  d'autre utilisateur.
- `__tests__/phase1/table-de-repartition.test.ts` : jamais exécuté (jest ignore `/phase1/`).

### admin

- `scenes/plan-transport/schema-repartition/` et `scenes/plan-transport/table-repartition/`.
- Trois composants qui n'étaient importés que par ces scènes :
  `plan-transport/components/{PlanTransportBreadcrumb,ProgressArc,ProgressBar}.jsx`.
- `components/drawer/SideBar.tsx` : l'entrée « Schéma de répartition » du menu transporteur, et
  l'icône `icons/Schema.jsx`, sans autre usage.
- `components/layout/RestrictedRoute.tsx` : `/schema-repartition` retiré des chemins autorisés du
  rôle TRANSPORTER et l'entrée `/table-repartition` retirée de `PERMISSIONS_BY_ROUTE`.

La page d'arrivée par défaut du transporteur était `/schema-repartition`. Elle devient `/centre`,
la seule page de ses chemins autorisés encore routée dans `app.tsx` : `/ligne-de-bus` et
`/point-de-rassemblement` ne le sont plus depuis #5214 non plus, et y renvoyer le transporteur
l'amènerait sur la page 404.

### snu-lib

`canViewSchemaDeRepartition`, `canCreateSchemaDeRepartition`, `canEditSchemaDeRepartition`,
`canDeleteSchemaDeRepartition`, `canEditTableDeRepartitionRegion` et
`canEditTableDeRepartitionDepartment` n'étaient appelées que par les deux contrôleurs supprimés.
Elles sont retirées de `roles.ts`. Aucune n'avait de test.

## 3. Ce qui est conservé

Les modèles `SchemaDeRepartitionModel` et `TableDeRepartitionModel`, leurs schémas dans
`packages/lib/src/mongoSchema/planDeTransport/`, la synchronisation Monstache de l'index
`tablederepartition` et la permission `TABLE_DE_REPARTITION_READ` restent en place, pour trois
lecteurs toujours actifs :

| Lecteur | Usage |
| --- | --- |
| `planDeTransport/ligneDeBus/ligneDeBusController.ts` | points de rassemblement proposés pour une ligne, à partir des groupes du centre |
| `planDeTransport/pointDeRassemblement/pointDeRassemblementController.ts` | garde de cohérence : un point de rassemblement référencé par un groupe |
| `services/dashboard/todo-sejour.service.js` | départements de la table de répartition, lus dans l'index ES `tablederepartition` |

Faute de route d'écriture, ces trois lecteurs portent désormais sur des données figées.

L'export des classes CLE `POST /elasticsearch/cle/classe/export?type=schema-de-repartition`, appelé
par `admin/src/scenes/classe/utils/index.ts`, est une fonctionnalité distincte : il n'est pas
concerné.

## 4. Vérification

Suite `api/src/__tests__/repartition-routes-supprimees.test.ts`, jouée avec un admin authentifié,
qui passe toutes les gardes des anciennes routes :

| Cas | Avant | Après |
| --- | --- | --- |
| 8 routes `/schema-de-repartition/…` (lecture, export, référentiels, écriture) | **rouge** (route montée) | 404 sans corps applicatif |
| 5 routes `/table-de-repartition/…` | **rouge** (route montée) | 404 sans corps applicatif |
| `GET /session-phase1/:id/schema-repartition` | **rouge** (route montée) | 404 sans corps applicatif |
| `GET /session-phase1/:id/cohesion-center` reste montée | vert | vert |

Le 404 attendu est celui d'Express par défaut, sans `{ ok, code }` : un gestionnaire encore monté qui
ne trouve pas la ressource répondrait aussi 404, mais avec un corps applicatif.

## 5. Suites

- Les collections `schemaderepartitions` et `tablederepartitions`, et l'index ES associé, ne sont
  pas supprimés : ce sera un chantier séparé, à mener une fois les trois lecteurs retirés ou
  réécrits.
- Les notifications `PLAN_TRANSPORT.MODIFICATION_SCHEMA` envoyées aux transporteurs
  (`cohesionCenter/cohesionCenterController.js`,
  `planDeTransport/pointDeRassemblement/pointDeRassemblementController.ts`) pointent toujours vers
  `/schema-repartition` sur l'admin. C'était déjà une page morte ; un transporteur qui suit le lien
  est désormais redirigé vers `/centre`.
