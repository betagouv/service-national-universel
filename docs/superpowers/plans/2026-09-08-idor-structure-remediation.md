# Remédiation IDOR `/structure` (API) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un référent de rôle `responsible` (et par extension `supervisor`, `referent_department`, `referent_region`) ne doit plus pouvoir lire des structures hors de son périmètre via les routes `/structure*` de l'API v1, ni en énumérer les identifiants via apiv2.

**Architecture:** Les permissions sont déjà en base (collection `permissions`, policies `where: {field, source}`) et chargées dans `req.user.acl`. La faille vient de routes qui posent `ignorePolicy: true` dans le middleware puis oublient d'appliquer la policy à la requête Mongo (`find({})`) ou au document chargé. La correction consiste à (1) ajouter dans `snu-lib` un helper qui traduit les policies de l'ACL en filtre Mongo (fail-closed), (2) l'utiliser sur la route liste, (3) vérifier la policy par document sur les sous-routes `/:id/mission` et `/:id/children`, (4) réduire la projection de `/networks`, (5) durcir `isAuthorized` contre l'égalité `undefined === undefined`, (6) appliquer le même périmètre à apiv2.

**Tech Stack:** Express + Mongoose (api), NestJS (apiv2), `snu-lib` (packages/lib, TypeScript, tests Jest `*.spec.ts`), Jest + supertest + mongodb-memory-server (api, `api/src/__tests__/*.test.ts`).

**Spec:** ce document (section « Constat » ci-dessous), issu de l'analyse du code le 2026-09-08.

## Global Constraints

- Node 20 obligatoire pour lancer les tests API (Node 26 casse `jwa`). En worktree, `npm test` complet échoue au chargement (types mongodb dupliqués) : lancer les fichiers de test ciblés, et considérer la CI comme la source de vérité (cf. mémoire `worktree-full-test-suite-blockers`).
- Rebuild de la lib après modification : `npm run build -w packages/lib` (les imports `snu-lib` de l'api pointent sur `packages/lib/dist`).
- Aucune migration de données : les permissions en base ne changent pas. Tout est corrigé côté code.
- Fail-closed partout : en l'absence de permission ou de valeur de policy exploitable, la réponse est `403`, jamais la liste complète.
- Ne pas casser : l'admin (`ROLES.ADMIN`, ACL `STRUCTURE_FULL` sans policy) doit toujours tout voir ; la page « Équipe » (`admin/src/scenes/team/list.jsx`) et l'édition utilisateur (`admin/src/scenes/utilisateur/edit/details.jsx`) appellent `GET /structure` avec des rôles référents et doivent continuer à recevoir les structures de leur département/région.

---

## Constat (analyse du 2026-09-08)

Fichier principal : `api/src/controllers/structure.ts`.

| # | Route | Ligne | Problème | Données exposées | Gravité |
|---|-------|-------|----------|------------------|---------|
| V1 | `GET /structure` | 333-346 | Middleware `STRUCTURE READ ignorePolicy: true` puis `StructureModel.find({})` sans filtre. Un `responsible` (ACL `StructureSameStructureread`, policy `_id == structureId`) reçoit **toutes** les structures. | Document complet (seul `jvaRawData` est retiré par `serializeStructure`) : nom, SIRET, adresse, et `structureManager` (prénom, nom, **mobile**, **email**). | **Critique** : c'est la faille confirmée. |
| V2 | `GET /structure/:id/mission` | 226-246 | `MISSION READ ignorePolicy` puis `MissionModel.find({ structureId })` sans vérifier l'appartenance de la structure. | Toutes les missions de n'importe quelle structure (tuteur, adresse, places…). | Élevée |
| V3 | `GET /structure/:id/children` | 201-224 | `canViewStructureChildren` inclut `RESPONSIBLE` ; aucune vérification que le réseau `:id` est dans le périmètre de l'utilisateur. | Fiches complètes des structures filles de n'importe quel réseau. | Élevée |
| V4 | `GET /structure/networks` | 185-199 | Retourne toutes les têtes de réseau, fiche complète, à tout rôle de `canViewStructureChildren` (dont `RESPONSIBLE`). Usage légitime : dropdown d'affiliation dans `admin/src/scenes/structure/create.jsx`. | `structureManager` des têtes de réseau. | Moyenne |
| V5 | `isAuthorized` (`packages/lib/src/permissions/accessControl.ts:37`) | 37 | `String(contextValue) === String(userValue)` vaut `true` quand **les deux** sont `undefined` (`"undefined" === "undefined"`). Un référent régional sans `region`, ou un superviseur dont la structure cible n'a pas de `networkId`, peut matcher par accident. | Contournement latent des policies sur toutes les ressources. | Moyenne (défense en profondeur) |
| V6 | apiv2 `POST /structure` (`apiv2/src/admin/infra/engagement/structure/api/Structure.controller.ts`) | 16-26 | `ResponsableGuard` autorisé, `findAll` sans périmètre. Projection limitée à `id, name, region, department, networkId`. | Énumération complète des `_id` de structures (facilite l'exploitation de V1-V3). | Faible / Moyenne |

Points vérifiés **sains** (ne pas toucher) :
- `GET /structure/:id` applique bien `isReadAuthorized` avec contexte → un `responsible` obtient `403` sur une autre structure. Ajouter un test de non-régression (Task 3).
- `GET /structure/:id/patches` : `patches.get` exige `USER_HISTORY` ou `PATCH` read, que `RESPONSIBLE` n'a pas → `403` (test existant). Seul défaut : le `404` est renvoyé avant le `403` (oracle d'existence), traité en Task 6.
- `POST /elasticsearch/structure/search|export` : `buildStructureContext` filtre correctement `RESPONSIBLE` et `SUPERVISOR`. La liste admin (`listV3.jsx`) passe par cette route.
- `PUT /:id`, `DELETE /:id`, `POST|DELETE /:id/representant` : contrôle par document présent.

Autres `find({})` repérés dans l'API, **hors périmètre de ce plan** mais à auditer ensuite : `department-service.ts:146`, `session-phase1.ts:191`, `program.ts:77` (déjà réservé admin).

---

## Structure des fichiers

- **Créer** `packages/lib/src/permissions/policyQuery.ts` : `getPolicyMongoFilter(user, resource, action)` → filtre Mongo ou `null` (accès total) ou `undefined` (aucun accès).
- **Créer** `packages/lib/src/permissions/policyQuery.spec.ts` : tests unitaires du helper.
- **Modifier** `packages/lib/src/permissions/index.ts` : exporter le helper.
- **Modifier** `packages/lib/src/permissions/accessControl.ts:29-44` : fail-closed sur valeurs vides (V5).
- **Modifier** `packages/lib/src/permissions/accessControl.spec.ts` : test V5.
- **Modifier** `api/src/controllers/structure.ts` : V1, V2, V3, V4, ordre 403/404.
- **Modifier** `api/src/__tests__/structure.test.ts` : tests de non-régression par rôle.
- **Modifier** `apiv2/src/admin/infra/engagement/structure/api/Structure.controller.ts`, `apiv2/src/admin/core/engagement/structure/Structure.gateway.ts`, `apiv2/src/admin/infra/engagement/structure/provider/StructureMongo.provider.ts` : V6.

---

## Phase 0 — Hotfix prioritaire (à déployer en premier)

Les Tasks 1 à 4 constituent le hotfix. Elles ferment V1, V2, V3 et couvrent la non-régression. Ouvrir la PR dès la Task 4 terminée ; les Tasks 5 à 8 peuvent suivre dans une seconde PR.

### Task 1 : Helper `getPolicyMongoFilter` dans snu-lib

**Files:**
- Create: `packages/lib/src/permissions/policyQuery.ts`
- Create: `packages/lib/src/permissions/policyQuery.spec.ts`
- Modify: `packages/lib/src/permissions/index.ts`

**Interfaces:**
- Consomme : `UserDto` (`user.acl: {resource, action, policy?: {where: {field, source?, value?, resource?}[]}[]}`), `PERMISSION_ACTIONS`.
- Produit : `getPolicyMongoFilter({ user, resource, action }): Record<string, unknown> | null | undefined`
  - `null` → l'utilisateur a au moins une permission **sans policy** sur la ressource : pas de restriction (`find({})`).
  - `undefined` → aucune permission exploitable : l'appelant doit répondre `403`.
  - objet → filtre Mongo `{ $or: [...] }` à passer à `find()`.

- [ ] **Étape 1 : écrire le test qui échoue**

```ts
// packages/lib/src/permissions/policyQuery.spec.ts
import { getPolicyMongoFilter } from "./policyQuery";
import { PERMISSION_ACTIONS } from "./constantes/actions";

const STRUCTURE = "structure";

describe("getPolicyMongoFilter", () => {
  it("returns undefined when user has no acl", () => {
    expect(getPolicyMongoFilter({ user: { _id: "u1" } as any, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });

  it("returns null (no restriction) when a permission has no policy", () => {
    const user = { _id: "u1", acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.FULL, policy: [] }] } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeNull();
  });

  it("builds an _id filter for a responsible", () => {
    const user = {
      _id: "u1",
      structureId: "s1",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({ $or: [{ _id: "s1" }] });
  });

  it("merges several permissions/policies into one $or (supervisor: own structure + network)", () => {
    const user = {
      _id: "u1",
      structureId: "s1",
      acl: [
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] },
        { resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "networkId", source: "structureId" }] }] },
      ],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({ $or: [{ _id: "s1" }, { networkId: "s1" }] });
  });

  it("uses $in when the user value is an array (referent_department)", () => {
    const user = {
      _id: "u1",
      department: ["Loire-Atlantique", "Vendée"],
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "department", source: "department" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({
      $or: [{ department: { $in: ["Loire-Atlantique", "Vendée"] } }],
    });
  });

  it("supports static values", () => {
    const user = {
      _id: "u1",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "region", value: "Bretagne" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toEqual({ $or: [{ region: "Bretagne" }] });
  });

  it("ignores where clauses targeting another resource", () => {
    const user = {
      _id: "u1",
      structureId: "s1",
      acl: [{ resource: "mission", action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ resource: "structure", field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: "mission", action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });

  it("is fail-closed: returns undefined when the user value is empty", () => {
    const user = {
      _id: "u1",
      structureId: "",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });

  it("ignores permissions for another action", () => {
    const user = {
      _id: "u1",
      structureId: "s1",
      acl: [{ resource: STRUCTURE, action: PERMISSION_ACTIONS.WRITE, policy: [{ where: [{ field: "_id", source: "structureId" }] }] }],
    } as any;
    expect(getPolicyMongoFilter({ user, resource: STRUCTURE, action: PERMISSION_ACTIONS.READ })).toBeUndefined();
  });
});
```

- [ ] **Étape 2 : vérifier l'échec**

```bash
cd packages/lib && npx jest src/permissions/policyQuery.spec.ts
```

Attendu : FAIL, `Cannot find module './policyQuery'`.

- [ ] **Étape 3 : implémenter le helper**

```ts
// packages/lib/src/permissions/policyQuery.ts
import { UserDto } from "../dto";
import { PERMISSION_ACTIONS } from "./constantes/actions";
import { PermissionType } from "../mongoSchema";

type Action = PermissionType["action"];

export interface GetPolicyMongoFilterParams {
  user: UserDto;
  resource: string;
  action?: Action;
}

/**
 * Traduit les policies de l'ACL de l'utilisateur en filtre Mongo pour une ressource/action.
 *
 * - `null`      : au moins une permission sans policy => aucune restriction.
 * - `undefined` : aucune permission exploitable => l'appelant doit refuser (403).
 * - objet       : filtre `{ $or: [...] }` à passer à `Model.find()`.
 *
 * Fail-closed : une clause `where` dont la valeur utilisateur est vide est ignorée ;
 * si aucune clause n'est exploitable, on renvoie `undefined`.
 */
export function getPolicyMongoFilter({ user, resource, action = PERMISSION_ACTIONS.READ }: GetPolicyMongoFilterParams): Record<string, unknown> | null | undefined {
  if (!user?.acl?.length) return undefined;

  const permissions = user.acl.filter((acl) => acl.resource === resource && [action, PERMISSION_ACTIONS.FULL].includes(acl.action));
  if (!permissions.length) return undefined;

  if (permissions.some((acl) => !acl.policy?.length)) return null;

  const clauses: Record<string, unknown>[] = [];
  for (const permission of permissions) {
    for (const policy of permission.policy) {
      for (const where of policy.where || []) {
        // une clause qui cible une autre ressource que celle interrogée ne peut pas être traduite en filtre sur cette collection
        if (where.resource && where.resource !== resource) continue;
        if (!where.field) continue;

        let value: unknown;
        if (where.source) {
          value = (user as Record<string, unknown>)[where.source];
        } else if (where.value) {
          value = where.value;
        }

        if (Array.isArray(value)) {
          const values = value.filter((v) => v !== undefined && v !== null && v !== "").map(String);
          if (!values.length) continue;
          clauses.push({ [where.field]: { $in: values } });
        } else if (value !== undefined && value !== null && value !== "") {
          clauses.push({ [where.field]: String(value) });
        }
      }
    }
  }

  if (!clauses.length) return undefined;
  return { $or: clauses };
}
```

Puis dans `packages/lib/src/permissions/index.ts`, ajouter l'export (vérifier la forme des exports existants avec `cat packages/lib/src/permissions/index.ts` et suivre le même style) :

```ts
export * from "./policyQuery";
```

- [ ] **Étape 4 : vérifier le succès**

```bash
cd packages/lib && npx jest src/permissions/policyQuery.spec.ts
```

Attendu : 9 tests PASS.

- [ ] **Étape 5 : builder la lib**

```bash
npm run build -w packages/lib
```

- [ ] **Étape 6 : commit**

```bash
git add packages/lib/src/permissions/policyQuery.ts packages/lib/src/permissions/policyQuery.spec.ts packages/lib/src/permissions/index.ts
git commit -m "feat(lib): getPolicyMongoFilter - traduit les policies ACL en filtre Mongo (fail-closed)"
```

---

### Task 2 : `GET /structure` filtré par périmètre (V1)

**Files:**
- Modify: `api/src/controllers/structure.ts:333-346`
- Test: `api/src/__tests__/structure.test.ts` (bloc `describe("GET /structure")`)

**Interfaces:**
- Consomme : `getPolicyMongoFilter` (Task 1) exporté par `snu-lib`.

- [ ] **Étape 0 : aligner le jeu de permissions des tests sur la production**

Le `beforeAll` actuel (`api/src/__tests__/structure.test.ts:21-26`) donne `STRUCTURE FULL` **sans policy** aux référents dép/rég et **aucune** permission structure aux rôles `RESPONSIBLE`/`SUPERVISOR`. Les tests de périmètre ne peuvent donc pas reproduire la prod. Remplacer le `beforeAll` par un seed identique à la migration `api/migrations/20250624122150-seed-responsable-permissions.js` (le helper `addPermissionHelper` accepte un 4e argument `policy`) :

```ts
beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  await PermissionModel.deleteMany({ roles: { $in: [ROLES.SUPERVISOR, ROLES.RESPONSIBLE] } });

  // Structure : même jeu que la migration 20250624122150 (policies incluses)
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.STRUCTURE, PERMISSION_ACTIONS.FULL);
  for (const action of [PERMISSION_ACTIONS.READ, PERMISSION_ACTIONS.WRITE]) {
    await addPermissionHelper([ROLES.REFERENT_REGION], PERMISSION_RESOURCES.STRUCTURE, action, [{ where: [{ field: "region", source: "region" }] }]);
    await addPermissionHelper([ROLES.REFERENT_DEPARTMENT], PERMISSION_RESOURCES.STRUCTURE, action, [{ where: [{ field: "department", source: "department" }] }]);
    await addPermissionHelper([ROLES.SUPERVISOR], PERMISSION_RESOURCES.STRUCTURE, action, [{ where: [{ field: "networkId", source: "structureId" }] }]);
    await addPermissionHelper([ROLES.RESPONSIBLE, ROLES.SUPERVISOR], PERMISSION_RESOURCES.STRUCTURE, action, [{ where: [{ field: "_id", source: "structureId" }] }]);
  }

  await addPermissionHelper([ROLES.ADMIN, ROLES.SUPERVISOR, ROLES.RESPONSIBLE], PERMISSION_RESOURCES.MISSION, PERMISSION_ACTIONS.FULL);
  await addPermissionHelper([ROLES.ADMIN], PERMISSION_RESOURCES.PATCH, PERMISSION_ACTIONS.READ);
});
```

Lancer ensuite le fichier complet pour vérifier que les tests existants restent verts avant toute modification du contrôleur :

```bash
cd api && npx jest src/__tests__/structure.test.ts --testTimeout=60000
```

Attendu : PASS (les tests existants utilisent `ADMIN`, ou `RESPONSIBLE`/`SUPERVISOR` en attendant un `403`). Si « should not update isNetwork when responsible » (ligne ~123) change de code de retour, c'est que le référent de test a désormais la permission avec policy : vérifier que son `structureId` est celui de la structure ciblée, le `403` doit alors venir du contrôle `isNetwork` du contrôleur (ligne 164) et non du middleware.

- [ ] **Étape 1 : écrire les tests qui échouent**

Remplacer le bloc `describe("GET /structure", ...)` (lignes ~189-196) par :

```ts
  describe("GET /structure", () => {
    it("ADMIN should return all structures", async () => {
      const structure = await createStructureHelper(getNewStructureFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN })).get("/structure");
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(expect.arrayContaining([expect.objectContaining({ _id: structure._id.toString() })]));
    });

    it("RESPONSIBLE should only see their own structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get("/structure");
      expect(res.status).toBe(200);
      const ids = res.body.data.map((s) => s._id);
      expect(ids).toContain(own._id.toString());
      expect(ids).not.toContain(other._id.toString());
    });

    it("SUPERVISOR should see their network and its children only", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({ ...getNewStructureFixture(), name: "child", networkId: network._id.toString() });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: network._id.toString() })).get("/structure");
      expect(res.status).toBe(200);
      const ids = res.body.data.map((s) => s._id);
      expect(ids).toEqual(expect.arrayContaining([network._id.toString(), child._id.toString()]));
      expect(ids).not.toContain(other._id.toString());
    });

    it("REFERENT_DEPARTMENT should only see structures of their departments", async () => {
      const inDep = await createStructureHelper({ ...getNewStructureFixture(), department: "Loire-Atlantique" });
      const outDep = await createStructureHelper({ ...getNewStructureFixture(), department: "Vendée" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.REFERENT_DEPARTMENT, department: ["Loire-Atlantique"] })).get("/structure");
      expect(res.status).toBe(200);
      const ids = res.body.data.map((s) => s._id);
      expect(ids).toContain(inDep._id.toString());
      expect(ids).not.toContain(outDep._id.toString());
    });

    it("RESPONSIBLE without structureId should get 403 (fail-closed)", async () => {
      await createStructureHelper(getNewStructureFixture());
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE })).get("/structure");
      expect(res.status).toBe(403);
    });
  });
```

Vérifier au préalable que le helper `getAppHelperWithAcl` (`api/src/__tests__/helpers/app.ts:27`) propage bien `structureId` et `department` dans `req.user` (il fait `getAcl(user)` puis injecte l'objet). Si un champ n'est pas propagé, l'ajouter dans le helper plutôt que de contourner dans le test.

- [ ] **Étape 2 : vérifier l'échec**

```bash
cd api && npx jest src/__tests__/structure.test.ts -t "GET /structure " --testTimeout=60000
```

Attendu : les 3 tests `RESPONSIBLE`, `SUPERVISOR`, `REFERENT_DEPARTMENT` échouent (`other` présent) et le test `403` échoue (reçoit 200).

- [ ] **Étape 3 : implémenter**

Dans `api/src/controllers/structure.ts`, ajouter `getPolicyMongoFilter` à l'import `snu-lib` (ligne 8-22), puis remplacer le handler de `router.get("/", ...)` :

```ts
router.get(
  "/",
  authMiddleware(["referent"]),
  permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      // Périmètre issu des policies de l'ACL : null = aucune restriction (admin), undefined = aucun accès exploitable.
      const scope = getPolicyMongoFilter({ user: req.user, resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ });
      if (scope === undefined) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const data = await StructureModel.find(scope ?? {});
      return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);
```

- [ ] **Étape 4 : vérifier le succès**

```bash
cd api && npx jest src/__tests__/structure.test.ts -t "GET /structure " --testTimeout=60000
```

Attendu : 5 tests PASS.

- [ ] **Étape 5 : commit**

```bash
git add api/src/controllers/structure.ts api/src/__tests__/structure.test.ts
git commit -m "fix(api): sécurité - GET /structure filtré par le périmètre de l'utilisateur (IDOR)"
```

---

### Task 3 : `GET /structure/:id/mission` et non-régression `GET /structure/:id` (V2)

**Files:**
- Modify: `api/src/controllers/structure.ts:226-246`
- Test: `api/src/__tests__/structure.test.ts`

- [ ] **Étape 1 : écrire les tests qui échouent**

Ajouter dans `describe("GET /structure/:id")` :

```ts
    it("RESPONSIBLE should get 403 on another structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get("/structure/" + other._id);
      expect(res.status).toBe(403);
    });
    it("RESPONSIBLE should read their own structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get("/structure/" + own._id);
      expect(res.status).toBe(200);
    });
```

Ajouter dans `describe("GET /structure/:id/mission")` :

```ts
    it("RESPONSIBLE should get 403 for missions of another structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const other = await createStructureHelper({ ...getNewStructureFixture(), name: "other" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: other._id });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get(`/structure/${other._id}/mission`);
      expect(res.status).toBe(403);
      await deleteMissionByIdHelper(mission._id);
    });
    it("RESPONSIBLE should list missions of their own structure", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const mission = await createMissionHelper({ ...getNewMissionFixture(), structureId: own._id });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get(`/structure/${own._id}/mission`);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toEqual(1);
      await deleteMissionByIdHelper(mission._id);
    });
    it("should return 404 when structure does not exist", async () => {
      const res = await request(await getAppHelperWithAcl({ role: ROLES.ADMIN })).get(`/structure/${notExistingStructureId}/mission`);
      expect(res.status).toBe(404);
    });
```

- [ ] **Étape 2 : vérifier l'échec**

```bash
cd api && npx jest src/__tests__/structure.test.ts -t "mission|GET /structure/:id " --testTimeout=60000
```

Attendu : les deux tests `GET /structure/:id` pour `RESPONSIBLE` passent déjà (le contrôle existe) ; le test `403` sur `/mission` échoue (reçoit 200) ; le `404` échoue (reçoit 200 avec `[]`).

- [ ] **Étape 3 : implémenter**

Remplacer le handler de `router.get("/:id/mission", ...)` :

```ts
router.get(
  "/:id/mission",
  authMiddleware(["referent"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.MISSION, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // La structure doit être dans le périmètre de lecture de l'utilisateur (policy STRUCTURE).
      if (
        !isReadAuthorized({
          user: req.user,
          resource: PERMISSION_RESOURCES.STRUCTURE,
          context: { structure: structure.toJSON() },
        })
      ) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const missions = await MissionModel.find({ structureId: req.validatedParams.id });
      return res.status(200).send({ ok: true, data: missions.map(serializeMission) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);
```

Note : `structure.toJSON()` produit `_id` en `ObjectId` ; `isAuthorized` compare via `String(...)`, donc la policy `_id == structureId` fonctionne (même usage déjà en place dans `PUT /:id`).

- [ ] **Étape 4 : vérifier le succès**

```bash
cd api && npx jest src/__tests__/structure.test.ts -t "mission|GET /structure/:id " --testTimeout=60000
```

Attendu : PASS.

- [ ] **Étape 5 : commit**

```bash
git add api/src/controllers/structure.ts api/src/__tests__/structure.test.ts
git commit -m "fix(api): sécurité - GET /structure/:id/mission vérifie le périmètre de la structure"
```

---

### Task 4 : `GET /structure/:id/children` limité au périmètre (V3)

**Files:**
- Modify: `api/src/controllers/structure.ts:201-224`
- Test: `api/src/__tests__/structure.test.ts`

Règle : l'utilisateur doit être autorisé en lecture (avec policy) sur la structure **parente** `:id`. Cela couvre : admin (tout), superviseur (son propre réseau via `_id == structureId`), référent dép/rég (réseau dans sa géographie), responsable (uniquement si `:id` est sa propre structure, ce qui ne renvoie des enfants que si elle est réseau).

- [ ] **Étape 1 : écrire les tests qui échouent**

Ajouter dans `describe("GET /structure/:id/children")` :

```ts
    it("SUPERVISOR should list children of their own network", async () => {
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      const child = await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id.toString(), name: "child" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: network._id.toString() })).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(200);
      expect(res.body.data.map((s) => s._id)).toContain(child._id.toString());
    });
    it("RESPONSIBLE should get 403 on children of another network", async () => {
      const own = await createStructureHelper({ ...getNewStructureFixture(), name: "own" });
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id.toString(), name: "child" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: own._id.toString() })).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(403);
    });
    it("SUPERVISOR should get 403 on children of another network", async () => {
      const mine = await createStructureHelper({ ...getNewStructureFixture(), name: "mine", isNetwork: "true" });
      const network = await createStructureHelper({ ...getNewStructureFixture(), name: "network", isNetwork: "true" });
      await createStructureHelper({ ...getNewStructureFixture(), networkId: network._id.toString(), name: "child" });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.SUPERVISOR, structureId: mine._id.toString() })).get(`/structure/${network._id}/children`);
      expect(res.status).toBe(403);
    });
```

- [ ] **Étape 2 : vérifier l'échec**

```bash
cd api && npx jest src/__tests__/structure.test.ts -t "children" --testTimeout=60000
```

Attendu : les deux tests `403` échouent (reçoivent 200).

- [ ] **Étape 3 : implémenter**

Remplacer le handler de `router.get("/:id/children", ...)` :

```ts
router.get(
  "/:id/children",
  authMiddleware(["referent"]),
  [
    requestValidatorMiddleware({
      params: Joi.object({ id: idSchema().required() }),
    }),
    permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }]),
  ],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      if (!canViewStructureChildren(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });

      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });

      // Le réseau parent doit être dans le périmètre de lecture de l'utilisateur.
      if (
        !isReadAuthorized({
          user: req.user,
          resource: PERMISSION_RESOURCES.STRUCTURE,
          context: { structure: structure.toJSON() },
        })
      ) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const data = await StructureModel.find({ networkId: structure._id });
      return res.status(200).send({ ok: true, data: serializeArray(data, req.user, serializeStructure) });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);
```

- [ ] **Étape 4 : vérifier le succès**

```bash
cd api && npx jest src/__tests__/structure.test.ts --testTimeout=60000
```

Attendu : tout le fichier PASS (inclut les anciens tests, dont « should return children of network » qui utilise l'ACL par défaut du helper : vérifier que ce défaut est admin ; sinon passer `{ role: ROLES.ADMIN }`).

- [ ] **Étape 5 : commit**

```bash
git add api/src/controllers/structure.ts api/src/__tests__/structure.test.ts
git commit -m "fix(api): sécurité - GET /structure/:id/children vérifie le périmètre du réseau"
```

- [ ] **Étape 6 : vérification front (pas de code)**

Confirmer que `admin/src/scenes/volontaires-responsible/listV2.jsx:168` appelle `/structure/${structure}/children` avec `structure = user.structureId` du superviseur connecté (lire les lignes 150-175). Si l'identifiant vient d'ailleurs, noter le cas dans la PR.

- [ ] **Étape 7 : ouvrir la PR hotfix**

Titre : `fix(api): sécurité - IDOR sur les routes /structure (liste, missions, enfants)`. Corps : résumé des V1-V3, tests ajoutés, et l'URL de session (cf. mémoire `pr-body-session-url`). Ne pas décrire la méthode d'exploitation dans la PR publique au-delà du nécessaire.

---

## Phase 1 — Durcissement (seconde PR)

### Task 5 : `GET /structure/networks` en projection minimale (V4)

**Files:**
- Modify: `api/src/controllers/structure.ts:185-199`
- Test: `api/src/__tests__/structure.test.ts`

- [ ] **Étape 1 : écrire le test qui échoue**

Ajouter dans `describe("GET /structure/networks")` :

```ts
    it("should not expose structureManager nor address on networks", async () => {
      await createStructureHelper({
        ...getNewStructureFixture(),
        name: "network",
        isNetwork: "true",
        structureManager: { firstName: "Jean", lastName: "Dupont", mobile: "0600000000", email: "jean@example.org", role: "Président" },
      });
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: "000000000000000000000001" })).get("/structure/networks");
      expect(res.status).toBe(200);
      const network = res.body.data.find((s) => s.name === "network");
      expect(network).toBeDefined();
      expect(network.structureManager).toBeUndefined();
      expect(network.address).toBeUndefined();
      expect(network.siret).toBeUndefined();
    });
```

- [ ] **Étape 2 : vérifier l'échec**

```bash
cd api && npx jest src/__tests__/structure.test.ts -t "networks" --testTimeout=60000
```

Attendu : FAIL (`structureManager` défini).

- [ ] **Étape 3 : implémenter**

```ts
router.get(
  "/networks",
  authMiddleware(["referent"]),
  [permissionAccessControlMiddleware([{ resource: PERMISSION_RESOURCES.STRUCTURE, action: PERMISSION_ACTIONS.READ, ignorePolicy: true }])],
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      if (!canViewStructureChildren(req.user)) return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      // Liste d'affiliation : seuls les champs d'identification sont nécessaires (pas de coordonnées du représentant).
      const data = await StructureModel.find({ isNetwork: "true" }).select("_id name networkName isNetwork region department").sort("name").lean();
      return res.status(200).send({ ok: true, data });
    } catch (error) {
      capture(error);
      res.status(500).send({ ok: false, code: ERRORS.SERVER_ERROR });
    }
  },
);
```

Vérifier que `admin/src/scenes/structure/create.jsx:42` n'utilise que `_id` et `name` des réseaux (lire les lignes 38-60). Si un autre champ est utilisé, l'ajouter au `select`.

- [ ] **Étape 4 : vérifier le succès**

```bash
cd api && npx jest src/__tests__/structure.test.ts -t "networks" --testTimeout=60000
```

- [ ] **Étape 5 : commit**

```bash
git add api/src/controllers/structure.ts api/src/__tests__/structure.test.ts
git commit -m "fix(api): GET /structure/networks - projection minimale sans coordonnées du représentant"
```

---

### Task 6 : `GET /structure/:id/patches` — vérifier les droits avant l'existence

**Files:**
- Modify: `api/src/controllers/structure.ts:248-271`
- Test: `api/src/__tests__/structure.test.ts`

- [ ] **Étape 1 : écrire le test qui échoue**

Ajouter dans `describe("GET /structure/:id/patches")` :

```ts
    it("should return 403 (not 404) to a RESPONSIBLE for an unknown structure", async () => {
      const res = await request(await getAppHelperWithAcl({ role: ROLES.RESPONSIBLE, structureId: "000000000000000000000001" }))
        .get(`/structure/${notExistingStructureId}/patches`)
        .send();
      expect(res.status).toBe(403);
    });
```

- [ ] **Étape 2 : vérifier l'échec** — `cd api && npx jest src/__tests__/structure.test.ts -t "patches" --testTimeout=60000` → reçoit 404.

- [ ] **Étape 3 : implémenter**

Ajouter `PERMISSION_RESOURCES.USER_HISTORY` / `PERMISSION_RESOURCES.PATCH` en contrôle amont dans le handler, avant le `findById` :

```ts
  async (req: RouteRequest<any>, res: RouteResponse<any>) => {
    try {
      if (
        !isReadAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.USER_HISTORY, ignorePolicy: true }) &&
        !isReadAuthorized({ user: req.user, resource: PERMISSION_RESOURCES.PATCH, ignorePolicy: true })
      ) {
        return res.status(403).send({ ok: false, code: ERRORS.OPERATION_UNAUTHORIZED });
      }

      const structure = await StructureModel.findById(req.validatedParams.id);
      if (!structure) return res.status(404).send({ ok: false, code: ERRORS.NOT_FOUND });
      // ... suite inchangée
```

Vérifier que `PERMISSION_RESOURCES.PATCH` existe (`grep -n "PATCH" packages/lib/src/mongoSchema/index.ts` ou le fichier `MONGO_COLLECTION`) ; `patches.ts:24` l'utilise déjà.

- [ ] **Étape 4 : vérifier** — même commande → PASS (et le test existant « should return 403 if not admin » reste vert).

- [ ] **Étape 5 : commit**

```bash
git add api/src/controllers/structure.ts api/src/__tests__/structure.test.ts
git commit -m "fix(api): GET /structure/:id/patches - contrôle des droits avant l'existence de la ressource"
```

---

### Task 7 : `isAuthorized` fail-closed sur valeurs vides (V5)

**Files:**
- Modify: `packages/lib/src/permissions/accessControl.ts:29-44`
- Test: `packages/lib/src/permissions/accessControl.spec.ts`

- [ ] **Étape 1 : écrire les tests qui échouent**

Ajouter à la fin du `describe` principal de `accessControl.spec.ts` (adapter les imports à ceux déjà présents dans le fichier) :

```ts
  describe("fail-closed on empty values", () => {
    const acl = [{ resource: "structure", action: PERMISSION_ACTIONS.READ, policy: [{ where: [{ field: "region", source: "region" }] }] }];

    it("refuses when both user value and context value are undefined", () => {
      const user = { _id: "u1", acl } as any;
      expect(isAuthorized({ user, resource: "structure", action: PERMISSION_ACTIONS.READ, context: { structure: { name: "x" } } })).toBe(false);
    });

    it("refuses when both are empty strings", () => {
      const user = { _id: "u1", region: "", acl } as any;
      expect(isAuthorized({ user, resource: "structure", action: PERMISSION_ACTIONS.READ, context: { structure: { region: "" } } })).toBe(false);
    });

    it("refuses when the context resource is missing", () => {
      const user = { _id: "u1", region: "Bretagne", acl } as any;
      expect(isAuthorized({ user, resource: "structure", action: PERMISSION_ACTIONS.READ, context: {} })).toBe(false);
    });

    it("still accepts a real match", () => {
      const user = { _id: "u1", region: "Bretagne", acl } as any;
      expect(isAuthorized({ user, resource: "structure", action: PERMISSION_ACTIONS.READ, context: { structure: { region: "Bretagne" } } })).toBe(true);
    });
  });
```

- [ ] **Étape 2 : vérifier l'échec**

```bash
cd packages/lib && npx jest src/permissions/accessControl.spec.ts -t "fail-closed"
```

Attendu : les deux premiers tests échouent (`true` au lieu de `false`).

- [ ] **Étape 3 : implémenter**

Remplacer les lignes 29-44 de `accessControl.ts` :

```ts
        if (policy.where?.length) {
          for (const where of policy.where) {
            const contextResource = where.resource || resource;
            const contextValue = contextUpdated[contextResource]?.[where.field];
            // fail-closed : une valeur absente ne peut jamais matcher
            if (contextValue === undefined || contextValue === null || contextValue === "") {
              authorized.push(false);
              continue;
            }
            if (where.source) {
              const userValue = user[where.source];
              if (Array.isArray(userValue)) {
                authorized.push(userValue.filter(Boolean).map(String).includes(String(contextValue)));
              } else if (userValue === undefined || userValue === null || userValue === "") {
                authorized.push(false);
              } else {
                authorized.push(String(contextValue) === String(userValue));
              }
            } else if (where.value) {
              authorized.push(String(contextValue) === String(where.value));
            } else {
              authorized.push(false);
            }
          }
        } else {
          authorized.push(false);
        }
```

- [ ] **Étape 4 : vérifier**

```bash
cd packages/lib && npx jest src/permissions/accessControl.spec.ts && npx jest src/roles.spec.ts
```

Attendu : PASS. Puis `npm run build -w packages/lib` et relancer `cd api && npx jest src/__tests__/structure.test.ts src/__tests__/mission.test.ts src/__tests__/referent.test.ts --testTimeout=60000` pour détecter une régression sur d'autres contrôleurs qui s'appuyaient involontairement sur l'égalité `undefined`.

- [ ] **Étape 5 : commit**

```bash
git add packages/lib/src/permissions/accessControl.ts packages/lib/src/permissions/accessControl.spec.ts
git commit -m "fix(lib): isAuthorized fail-closed - une valeur vide ne matche jamais une policy"
```

---

### Task 8 : apiv2 `POST /structure` limité au périmètre (V6)

**Files:**
- Modify: `apiv2/src/admin/infra/engagement/structure/api/Structure.controller.ts`
- Modify: `apiv2/src/admin/core/engagement/structure/Structure.gateway.ts`
- Modify: `apiv2/src/admin/infra/engagement/structure/provider/StructureMongo.provider.ts`
- Test: fichier de test existant du contrôleur ou du provider (chercher avec `ls apiv2/src/admin/infra/engagement/structure/**/*.spec.ts` ; sinon créer `apiv2/src/admin/infra/engagement/structure/api/Structure.controller.spec.ts` sur le modèle d'un autre `*.controller.spec.ts` du dossier `apiv2/src/admin/infra`).

**Interfaces:**
- Produit : `StructureGateway.findAll(projection?, filter?: Record<string, unknown>)`.
- Le périmètre est calculé côté contrôleur à partir de l'utilisateur courant (récupérer l'utilisateur via le décorateur déjà utilisé par les autres contrôleurs apiv2 : `grep -rn "@Request()\|CustomRequest\|req.user" apiv2/src/admin/infra --include=*.controller.ts | head`).

- [ ] **Étape 1 : écrire le test qui échoue**

Test du contrôleur (mock du gateway) :

```ts
    it("passes a scope filter for a RESPONSIBLE", async () => {
      const gateway = { findAll: jest.fn().mockResolvedValue([]) };
      const controller = new StructureController(gateway as any);
      const req = { user: { role: ROLES.RESPONSIBLE, structureId: "s1" } } as any;
      await controller.findAll({ fields: ["id", "name"] }, req);
      expect(gateway.findAll).toHaveBeenCalledWith(["id", "name"], { $or: [{ _id: "s1" }, { networkId: "s1" }] });
    });
    it("passes no filter for an ADMIN", async () => {
      const gateway = { findAll: jest.fn().mockResolvedValue([]) };
      const controller = new StructureController(gateway as any);
      const req = { user: { role: ROLES.ADMIN } } as any;
      await controller.findAll({}, req);
      expect(gateway.findAll).toHaveBeenCalledWith(undefined, undefined);
    });
```

- [ ] **Étape 2 : vérifier l'échec** — `cd apiv2 && npx jest src/admin/infra/engagement/structure --testTimeout=60000` → FAIL (signature).

- [ ] **Étape 3 : implémenter**

Dans le contrôleur, calculer le périmètre par rôle (apiv2 n'a pas l'ACL Mongo chargée dans `req.user` de la même façon que l'api ; on reste explicite par rôle, aligné sur `buildStructureContext` de `api/src/controllers/elasticsearch/structure.ts:24-48`) :

```ts
    @Post("/")
    @UseAnyGuard(AdminGuard, ReferentRegionalGuard, ReferentDepartementalGuard, ResponsableGuard, SupervisorGuard)
    async findAll(@Body() body: StructureProjectionPayloadDto, @Request() request: CustomRequest): Promise<Partial<StructureModel>[]> {
        let projection: (keyof StructureModel)[] | undefined;
        if (body.fields) {
            projection = body.fields.filter((field) => STRUCTURE_PROJECTION_KEYS.includes(field));
        }
        const filter = buildStructureScopeFilter(request.user);
        if (filter === undefined) throw new ForbiddenException();
        return this.structureGateway.findAll(projection, filter);
    }
```

et, dans le même fichier (ou un `Structure.scope.ts` voisin) :

```ts
export function buildStructureScopeFilter(user: { role?: string; structureId?: string; department?: string[] | string; region?: string }): Record<string, unknown> | null | undefined {
    switch (user.role) {
        case ROLES.ADMIN:
            return null;
        case ROLES.REFERENT_REGION:
            return user.region ? { region: user.region } : undefined;
        case ROLES.REFERENT_DEPARTMENT: {
            const deps = (Array.isArray(user.department) ? user.department : [user.department]).filter(Boolean);
            return deps.length ? { department: { $in: deps } } : undefined;
        }
        case ROLES.RESPONSIBLE:
        case ROLES.SUPERVISOR:
            return user.structureId ? { $or: [{ _id: user.structureId }, { networkId: user.structureId }] } : undefined;
        default:
            return undefined;
    }
}
```

Gateway : `findAll(projection?: (keyof StructureModel)[], filter?: Record<string, unknown> | null): Promise<Partial<StructureModel>[]>`. Provider Mongo : passer `filter ?? {}` au `find()` existant (lire l'implémentation actuelle avant de modifier ; conserver la projection).

- [ ] **Étape 4 : vérifier** — même commande → PASS ; puis `cd apiv2 && npx tsc --noEmit -p tsconfig.json`.

- [ ] **Étape 5 : commit**

```bash
git add apiv2/src/admin
git commit -m "fix(apiv2): POST /structure limité au périmètre de l'utilisateur"
```

---

## Phase 2 — Vérification, déploiement, suites

### Task 9 : Vérification manuelle en staging (après déploiement du hotfix)

- [ ] Se connecter en staging avec un compte `responsible` et récupérer le JWT (cookie / header comme le fait l'admin).
- [ ] Exécuter, en remplaçant `<TOKEN>` et `<AUTRE_ID>` (une structure qui n'est pas la sienne) :

```bash
curl -s -H "Authorization: JWT <TOKEN>" https://api.beta-snu.dev/structure | jq '.data | length'
```

Attendu : `1` (ou 2 si la structure a un réseau parent, uniquement via ES ; ici `1`).

```bash
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: JWT <TOKEN>" https://api.beta-snu.dev/structure/<AUTRE_ID>
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: JWT <TOKEN>" https://api.beta-snu.dev/structure/<AUTRE_ID>/mission
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: JWT <TOKEN>" https://api.beta-snu.dev/structure/<AUTRE_ID>/children
```

Attendu : `403` trois fois.

- [ ] Rejouer les mêmes appels avec un compte `referent_department` et vérifier que la page « Équipe » de l'admin (`/team`) et l'édition d'un utilisateur affichent toujours les structures du département.
- [ ] Vérifier avec un compte `supervisor` que la page volontaires (`volontaires-responsible`) liste toujours les sous-structures.

### Task 10 : Investigation d'exploitation (hors code)

- [ ] Rechercher dans les logs d'accès (Kibana `logstash-*` ; attention : drains Clever Cloud à recréer si les logs sont absents depuis le 11 juin 2026, cf. mémoire `logs-es-drain-incident`) les appels `GET /structure` (sans id) et `GET /structure/*/mission|children` émis par des comptes de rôle `responsible`/`supervisor` : volume, comptes, IP, période.
- [ ] Croiser avec la revendication LunarisSec (mémoire `snu-breach-lunarissec-2026-09`) : le jeu « structures » (nom, SIRET, adresse, `structureManager` mobile/email) correspond-il à un des jeux publiés ? Si oui, documenter V1 comme vecteur probable.
- [ ] Décision côté SNU (pas dans ce plan) : notification CNIL sous 72 h si l'exposition de données personnelles (coordonnées des représentants de structure) est confirmée.

### Task 11 : Audit horizontal du même motif

- [ ] Lister toutes les routes de l'API v1 qui combinent `permissionAccessControlMiddleware(... ignorePolicy: true)` et une requête Mongo non filtrée ou un `findById` sans `isReadAuthorized`/`isWriteAuthorized` sur le document :

```bash
grep -rn "ignorePolicy: true" api/src/controllers | cut -d: -f1 | sort | uniq -c | sort -rn
```

- [ ] Pour chaque contrôleur, vérifier ligne à ligne la présence d'un contrôle par document ; consigner le résultat dans `docs/superpowers/plans/2026-09-08-idor-structure-remediation.md` (section « Audit horizontal — résultats ») avec, pour chaque route : OK / à corriger / hors périmètre. Priorités connues : `department-service.ts:146`, `session-phase1.ts:191`, et les routes `GET /` de `mission.ts` et `referent`-like.
- [ ] Ouvrir un ticket par contrôleur à corriger, en réutilisant `getPolicyMongoFilter` (Task 1).

---

## Auto-revue

- **Couverture du constat** : V1 → Task 2 ; V2 → Task 3 ; V3 → Task 4 ; V4 → Task 5 ; V5 → Task 7 ; V6 → Task 8 ; oracle 404/403 → Task 6 ; vérification et suites → Tasks 9-11.
- **Cohérence des noms** : `getPolicyMongoFilter({ user, resource, action })` (Task 1) est utilisé tel quel en Task 2 ; `isReadAuthorized({ user, resource, context: { structure } })` (existant) est utilisé en Tasks 3, 4, 6 ; `buildStructureScopeFilter(user)` et `findAll(projection, filter)` (Task 8) sont cohérents entre contrôleur, gateway et test.
- **Vérifié** : `getAppHelperWithAcl` (`api/src/__tests__/helpers/app.ts:27`) calcule l'ACL avec `getAcl(user)` puis injecte l'objet `user` entier dans `req.user`, donc `structureId`/`department` passés au helper sont bien disponibles pour les policies ; son défaut sans argument est `ADMIN` (les anciens tests `children`/`networks` restent valides). Le seed de permissions des tests ne reflétait pas la prod : corrigé en Task 2, étape 0.
- **Hypothèse à vérifier à l'exécution** : le décorateur de requête apiv2 pour obtenir `request.user` (Task 8).
