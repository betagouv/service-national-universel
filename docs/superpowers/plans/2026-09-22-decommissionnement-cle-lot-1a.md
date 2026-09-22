# Décommissionnement de l'administration CLE — lot 1a

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Supprimer la chaîne publique d'inscription des référents CLE et les 19 routes d'administration CLE, retirer les rôles CLE des permissions en base, et retirer les commandes d'écriture correspondantes du front admin.

**Architecture:** Suppression par démontage progressif, routeur par routeur. Chaque tâche écrit d'abord un test qui exige un 404 sur les routes visées, constate son échec, supprime les routes et le code devenu orphelin, puis constate le succès. Les routes de consultation ne sont pas touchées : elles font l'objet du lot 1b. Le front admin perd ses commandes d'écriture mais garde ses vues de liste et de détail.

**Tech Stack:** Node 20 / TypeScript, Express (api v1), Jest + supertest, Mongoose, migrate-mongo, React (admin), monorepo Turbo avec `snu-lib` dans `packages/lib`.

**Spec:** [docs/superpowers/specs/2026-09-21-decommissionnement-cle-design.md](../specs/2026-09-21-decommissionnement-cle-design.md)

## Global Constraints

- Dépôt **public** : aucun détail d'exploitation dans les messages de commit ni dans le code. Référencer les constats par identifiant (C1, H8…), comme #5306, #5307, #5308.
- Branche de travail : partir de `main`, ne jamais commiter directement dessus. Nom proposé : `feat/decommissionnement-cle-lot-1a`.
- Aucune donnée n'est supprimée ni modifiée, hors le champ `status` des comptes référents CLE (tâche 6).
- Les constantes `ROLES.ADMINISTRATEUR_CLE` et `ROLES.REFERENT_CLASSE` **restent définies** dans `packages/lib/src/roles.ts` : 27 fichiers de `admin`/`app` et 26 fichiers de `api` hors `api/src/cle` les importent.
- Les routes de consultation listées au §4.1 de la spec **ne sont pas touchées** par ce plan.
- **Un 404 ne suffit pas à prouver qu'une route est démontée.** Plusieurs gestionnaires CLE renvoient eux-mêmes 404 quand la ressource est introuvable, ce qui est indiscernable du 404 d'Express sur une route absente — un test qui se contente de `expect(status).toBe(404)` reste vert même si la suppression n'a pas eu lieu. Toute assertion de suppression passe donc par le helper `expectRouteRemoved(method, path)` du fichier de test partagé, qui exige en plus l'absence du corps JSON de l'API (`{ ok: false, code: … }`). Les gardes-fous de consultation, eux, interrogent avec un identifiant **invalide** : 400 sur une route vivante, 404 si elle a disparu.
- **Node 20 obligatoire** (`.nvmrc` : 20.17, `engines` : `^20.17`). Préfixer chaque commande par `export PATH="/opt/homebrew/opt/node@20/bin:$PATH"` : le Node par défaut de la machine est en v26 et ne correspond pas à ce que le projet attend.
- **Avant la première commande de test**, construire `snu-lib` : `cd packages/lib && npm run build`. Le worktree hérite d'un `dist` périmé, et l'API ne compile pas sans ça.
- Tests api : `cd api && npx jest <chemin> --silent --testTimeout=60000 --maxWorkers=1`.
- Si un test échoue avec un message **vide**, ou sur `TS2305: Module '"snu-lib"' has no exported member …`, c'est une entrée de cache ts-jest périmée : relancer **une fois** avec `--no-cache` (jamais `--clearCache`, qui vide le cache partagé avec les autres worktrees). Les lancements suivants repartent normalement.
- Les tests parlent à MongoDB en local uniquement : [db.ts](../../../api/src/__tests__/helpers/db.ts) code en dur `mongodb://localhost:27017/snu-test_*`. **Ne jamais introduire de `api/.env` dans le worktree** : il porte des identifiants de services réels, et aucun test n'en a besoin.
- **`api/jest.config.js` ignore `/phase1/`** (`testPathIgnorePatterns`). Les fichiers de `api/src/__tests__/phase1/**` ne s'exécutent donc **jamais**. Le nouveau fichier de test de ce lot vit à plat dans `api/src/__tests__/`, comme `email-scope.test.ts` (#5309) et `elasticsearch-scope.test.ts` (#5310). Quand une tâche demande de supprimer des blocs dans un test de `phase1/`, c'est de l'hygiène : ne pas s'attendre à ce que ces fichiers tournent, et ne jamais y déplacer une assertion qu'on veut voir s'exécuter.
- Suite complète api : `cd api && npm test`.
- Vérification des types : `cd api && npm run check-types`, `cd admin && npm run check-types`.

## Écart assumé par rapport à la spec

La spec §3.2 prévoit de retirer les rôles CLE « des tableaux d'habilitation et des branches des helpers `canXxx` » de `roles.ts`. Le relevé donne **plus de 40 sites**, dont beaucoup gardent des routes conservées ou des modules hors CLE. Un balayage global dans ce lot risquerait des régressions sur des parcours ADMIN et référent départemental vivants, pour un gain de sécurité nul : après la tâche 6, les rôles CLE ne portent plus aucune permission et aucun compte CLE ne peut s'authentifier.

Ce plan restreint donc la tâche 7 aux helpers **devenus non référencés** après la suppression des routes, ce qui se vérifie par `grep`. Le reste du balayage est reporté au lot 1b, où le travail de périmètre sur les routes conservées s'accompagne de tests par rôle.

## Préalable bloquant (hors code)

- [ ] **Comptage §7.1** — nombre de documents `referent` dont `role ∈ {administrateur_cle, referent_classe}` et `status ≠ INACTIVE`. Attendu : 0. Si non nul, comprendre la voie de réactivation avant de poursuivre.
- [ ] **Relevé §7.2** — trafic sur 30 jours des 19 routes des tâches 1 à 5. Attendu : nul hors scanners. Un appel authentifié récent sur une de ces routes invalide son classement en « administration morte » et doit être instruit avant suppression.

Consigner les deux résultats dans la description de la PR.

---

### Task 1: Supprimer la chaîne publique `/cle/referent-signup`

C'est la tâche la plus urgente du lot : ce routeur ne porte aucun middleware d'authentification, et son étape finale résout un compte par `findOne({ invitationToken })` sans filtrer sur le rôle. Ferme H19 et H20.

**Files:**
- Create: `api/src/__tests__/cle-routes-supprimees.test.ts`
- Modify: `api/src/cle/index.ts`
- Modify: `admin/src/app.tsx:110,150-151`
- Delete: `api/src/cle/referent/referentSignupController.ts`, `api/src/cle/referent/referentSignupController.d.ts`
- Delete: `api/src/__tests__/phase1/cle/referent-signup.test.ts`
- Delete: `admin/src/scenes/signup/` (dossier complet : `index.tsx`, `EmailForm.tsx`, `CodeForm.tsx`, `InformationsForm.tsx`, `ConfirmationForm.tsx`, `RoleForm.tsx`, `components/`)

**Interfaces:**
- Consumes: rien.
- Produces: le fichier de test `routes-supprimees.test.ts`, que les tâches 2 à 5 complètent avec leurs propres blocs `describe`. Son en-tête (imports, `beforeAll`/`afterAll`) est créé ici et réutilisé tel quel ensuite.

- [ ] **Step 1: Écrire le test qui échoue**

Créer `api/src/__tests__/cle-routes-supprimees.test.ts` :

```ts
import request from "supertest";

import { dbConnect, dbClose } from "./helpers/db";
import getAppHelper from "./helpers/app";

beforeAll(() => dbConnect(__filename.slice(__dirname.length + 1, -3)));
afterAll(dbClose);

type Method = "get" | "post" | "put" | "delete";

async function callRoute(method: Method, path: string) {
  const agent = request(getAppHelper()) as any;
  return agent[method](path).send({});
}

describe("Routes CLE supprimées — chaîne d'inscription référent (H19, H20)", () => {
  const routes: [Method, string][] = [
    ["get", "/cle/referent-signup/token/abcdef"],
    ["put", "/cle/referent-signup/request-confirmation-email"],
    ["post", "/cle/referent-signup/confirm-email"],
    ["post", "/cle/referent-signup/confirm-signup"],
    ["post", "/cle/referent-signup/"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : ÉCHEC. Les routes répondent 400, 404 selon le token, ou 200 — pas systématiquement 404. Au moins un cas doit échouer, typiquement `post /cle/referent-signup/` qui répond 400 (`INVALID_BODY`) au lieu de 404.

- [ ] **Step 3: Démonter le routeur**

Dans `api/src/cle/index.ts`, supprimer la ligne :

```ts
router.use("/referent-signup", require("./referent/referentSignupController").default);
```

- [ ] **Step 4: Supprimer le contrôleur et son test**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
rm api/src/cle/referent/referentSignupController.ts api/src/cle/referent/referentSignupController.d.ts
rm api/src/__tests__/phase1/cle/referent-signup.test.ts
```

- [ ] **Step 5: Lancer le test et vérifier qu'il passe**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : SUCCÈS, 5 cas verts.

- [ ] **Step 6: Supprimer la scène d'inscription du front admin**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
rm -r admin/src/scenes/signup
```

Dans `admin/src/app.tsx`, supprimer la déclaration (ligne 110) :

```tsx
const Signup = lazy(() => import("./scenes/signup"));
```

et les deux routes (lignes 150-151) :

```tsx
<SentryRoute path="/creer-mon-compte" component={Signup} />
<SentryRoute path="/verifier-mon-compte" component={Signup} />
```

- [ ] **Step 7: Vérifier qu'aucune référence ne subsiste**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
grep -rn "referent-signup\|scenes/signup" api/src admin/src app/src packages/lib/src
```

Attendu : aucun résultat. Tout résultat est une référence orpheline à supprimer avant de continuer.

- [ ] **Step 8: Vérifier les types**

```bash
cd api && npm run check-types && cd ../admin && npm run check-types
```

Attendu : aucune erreur.

- [ ] **Step 9: Commit**

```bash
git add api/src/cle/index.ts api/src/__tests__ admin/src/app.tsx admin/src/scenes
git commit -m "$(cat <<'EOF'
feat(api,admin): décommissionnement CLE - suppression de la chaîne d'inscription référent (H19, H20)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Supprimer les écritures du routeur `classe`

Ferme H8 (génération de PDF d'élèves), H10 (création de classe), H11 (modification), H12 (réaffectation de référent), H13 (désistement). Les routes de lecture `GET /:id`, `GET /from-etablissement/:id`, `GET /public/:id`, `GET /:id/patches` et `POST /export` sont **conservées** : elles relèvent du lot 1b.

**Files:**
- Modify: `api/src/__tests__/cle-routes-supprimees.test.ts`
- Modify: `api/src/cle/classe/classeController.ts` (retrait de 7 routes)
- Modify: `api/src/__tests__/phase1/cle/classe.test.ts` (retrait des tests des routes supprimées)

**Interfaces:**
- Consumes: `callRoute` et le type `Method` définis en tâche 1.
- Produces: rien pour les tâches suivantes.

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter à la fin de `api/src/__tests__/cle-routes-supprimees.test.ts` :

```ts
describe("Routes CLE supprimées — administration des classes (H8, H10-H13)", () => {
  const routes: [Method, string][] = [
    ["post", "/cle/classe/5f1c5b0a0000000000000000/certificate/convocation"],
    ["post", "/cle/classe"],
    ["put", "/cle/classe/5f1c5b0a0000000000000000"],
    ["put", "/cle/classe/5f1c5b0a0000000000000000/referent"],
    ["put", "/cle/classe/5f1c5b0a0000000000000000/verify"],
    ["delete", "/cle/classe/5f1c5b0a0000000000000000"],
    ["get", "/cle/classe/5f1c5b0a0000000000000000/notifyRef"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});

describe("Routes CLE de consultation — conservées pour le lot 1b", () => {
  // On interroge avec un identifiant INVALIDE : une route vivante répond 400 (validateId),
  // une route supprimée répond 404. Un ObjectId bien formé mais inexistant répondrait 404
  // sur une route vivante et rendrait le garde-fou faussement rouge.
  it("GET /cle/classe/:id est toujours montée", async () => {
    const response = await callRoute("get", "/cle/classe/identifiant-invalide");
    expect(response.status).toBe(400);
  });

  it("GET /cle/classe/from-etablissement/:id est toujours montée", async () => {
    const response = await callRoute("get", "/cle/classe/from-etablissement/identifiant-invalide");
    expect(response.status).toBe(400);
  });

  it("POST /cle/classe/export est toujours montée", async () => {
    const response = await callRoute("post", "/cle/classe/export");
    expect(response.status).not.toBe(404);
  });
});
```

Le second bloc est un garde-fou : il échouera si la suppression déborde sur la consultation.

Si l'un des deux cas à 400 ne passe pas dès l'étape 2, c'est que la route valide son entrée autrement : relever le code réellement renvoyé sur la branche `main` intacte et ajuster l'attente **avant** de supprimer quoi que ce soit.

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : ÉCHEC sur le bloc « administration des classes ». Le bloc « consultation » doit déjà passer.

- [ ] **Step 3: Supprimer les 7 routes du contrôleur**

Dans `api/src/cle/classe/classeController.ts`, supprimer les blocs complets de :

| Ligne d'ancrage | Route |
|---|---|
| 85 | `router.post("/:id/certificate/:key", …)` |
| 206 | `router.post("/", requestValidatorMiddleware({ body: ClassesRoutesSchema.Create.payload }), …)` |
| 298 | `router.put("/:id", …)` |
| 400 | `router.put("/:id/referent", …)` |
| 514 | `router.delete("/:id", …)` |
| 552 | `router.get("/:id/notifyRef", …)` |
| 587 | `router.put("/:id/verify", …)` |

Les numéros de ligne se décalent au fur et à mesure des suppressions : repérer chaque route par sa signature, pas par sa ligne. Supprimer ensuite les imports devenus inutilisés en tête de fichier — le lint les signalera.

- [ ] **Step 4: Retirer les tests des routes supprimées**

Dans `api/src/__tests__/phase1/cle/classe.test.ts`, supprimer les blocs `describe` correspondant aux 7 routes ci-dessus. Conserver les blocs des routes de consultation.

- [ ] **Step 5: Lancer les tests et vérifier qu'ils passent**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : SUCCÈS, y compris le bloc « consultation » de la tâche 2.

- [ ] **Step 6: Vérifier le lint et les types**

```bash
cd api && npm run lint && npm run check-types
```

Attendu : aucune erreur. Les imports orphelins (`ClassesRoutesSchema.Create`, helpers de certificat) doivent avoir été retirés.

- [ ] **Step 7: Commit**

```bash
git add api/src/cle/classe/classeController.ts api/src/__tests__
git commit -m "$(cat <<'EOF'
feat(api): décommissionnement CLE - suppression des écritures sur les classes (H8, H10, H11, H12, H13)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Supprimer les écritures du routeur `etablissement`

Ferme H15 (modification de n'importe quel établissement) et H16 (suppression des coordinateurs d'un autre établissement). `GET /:id` et `GET /from-user` sont **conservées** : elles portent H14, traité au lot 1b.

**Files:**
- Modify: `api/src/__tests__/cle-routes-supprimees.test.ts`
- Modify: `api/src/cle/etablissement/etablissementController.ts` (retrait de 4 routes)
- Modify: `api/src/__tests__/phase1/cle/etablissement.test.ts`

**Interfaces:**
- Consumes: `callRoute` et `Method` de la tâche 1.
- Produces: rien.

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter à `api/src/__tests__/cle-routes-supprimees.test.ts` :

```ts
describe("Routes CLE supprimées — administration des établissements (H15, H16)", () => {
  const routes: [Method, string][] = [
    ["post", "/cle/etablissement"],
    ["put", "/cle/etablissement/5f1c5b0a0000000000000000"],
    ["put", "/cle/etablissement/5f1c5b0a0000000000000000/referents"],
    ["delete", "/cle/etablissement/5f1c5b0a0000000000000000/referents"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });

  // Identifiant invalide, même raison qu'en tâche 2 : 400 sur une route vivante, 404 si supprimée.
  it("GET /cle/etablissement/:id est toujours montée", async () => {
    const response = await callRoute("get", "/cle/etablissement/identifiant-invalide");
    expect(response.status).toBe(400);
  });
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : ÉCHEC sur les 4 premiers cas.

- [ ] **Step 3: Supprimer les 4 routes du contrôleur**

Dans `api/src/cle/etablissement/etablissementController.ts`, supprimer les blocs de `router.post("/", …)`, `router.put("/:id", …)`, `router.put("/:id/referents", …)` et `router.delete("/:id/referents", …)`. Conserver `router.get("/from-user", …)` et `router.get("/:id", …)`.

- [ ] **Step 4: Retirer les tests des routes supprimées**

Dans `api/src/__tests__/phase1/cle/etablissement.test.ts`, supprimer les blocs `describe` des 4 routes ci-dessus.

- [ ] **Step 5: Lancer les tests et vérifier qu'ils passent**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : SUCCÈS.

- [ ] **Step 6: Vérifier le lint et les types**

```bash
cd api && npm run lint && npm run check-types
```

- [ ] **Step 7: Commit**

```bash
git add api/src/cle/etablissement/etablissementController.ts api/src/__tests__
git commit -m "$(cat <<'EOF'
feat(api): décommissionnement CLE - suppression des écritures sur les établissements (H15, H16)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Supprimer les écritures des routeurs `referent` et `classes`

Ferme H17 (invitation d'un coordinateur dans n'importe quel établissement). `POST /cle/referent/getMany` est **conservée** : elle porte H18, traité au lot 1b.

**Files:**
- Modify: `api/src/__tests__/cle-routes-supprimees.test.ts`
- Modify: `api/src/cle/referent/referentController.ts` (retrait de 4 routes)
- Modify: `api/src/cle/index.ts` (démontage de `/classes`)
- Modify: `api/src/__tests__/phase1/cle/referent.test.ts`
- Delete: `api/src/cle/classes/classesController.ts`, `api/src/cle/classes/classesController.d.ts`, `api/src/cle/classes/classesService.ts`, `api/src/cle/classes/classesService.test.ts`, `api/src/cle/classes/classesValidator.ts`, `api/src/cle/classes/classesValidator.d.ts`
- Delete: `api/src/__tests__/phase1/cle/classes.test.ts`

**Interfaces:**
- Consumes: `callRoute` et `Method` de la tâche 1.
- Produces: rien.

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter à `api/src/__tests__/cle-routes-supprimees.test.ts` :

```ts
describe("Routes CLE supprimées — invitations et mises à jour de référents (H17)", () => {
  const routes: [Method, string][] = [
    ["post", "/cle/referent/invite-coordonnateur"],
    ["post", "/cle/referent/send-invitation-chef-etablissement"],
    ["post", "/cle/referent/send-invitation-referent-classe-verifiee"],
    ["post", "/cle/referent/delete-old-referent-classe"],
    ["put", "/cle/classes/update-referents"],
    ["put", "/cle/classes/update-referents-by-csv"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });

  it("POST /cle/referent/getMany ne répond pas 404", async () => {
    const response = await callRoute("post", "/cle/referent/getMany");
    expect(response.status).not.toBe(404);
  });
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : ÉCHEC sur les 6 premiers cas.

- [ ] **Step 3: Supprimer les 4 routes de `referentController`**

Dans `api/src/cle/referent/referentController.ts`, supprimer les blocs de `router.post("/invite-coordonnateur", …)`, `router.post("/send-invitation-chef-etablissement", …)`, `router.post("/send-invitation-referent-classe-verifiee", …)` et `router.post("/delete-old-referent-classe", …)`. Conserver `router.post("/getMany", accessControlMiddleware([ROLES.ADMIN]), …)`.

- [ ] **Step 4: Démonter et supprimer le routeur `classes`**

Dans `api/src/cle/index.ts`, supprimer la ligne :

```ts
router.use("/classes", require("./classes/classesController").default);
```

Puis :

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
rm -r api/src/cle/classes
rm api/src/__tests__/phase1/cle/classes.test.ts
```

- [ ] **Step 5: Lancer les tests et vérifier qu'ils passent**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : SUCCÈS.

- [ ] **Step 6: Vérifier qu'aucune référence ne subsiste**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
grep -rn "cle/classes\|classesService\|classesValidator" api/src admin/src packages/lib/src
```

Attendu : aucun résultat.

- [ ] **Step 7: Vérifier le lint et les types**

```bash
cd api && npm run lint && npm run check-types
```

- [ ] **Step 8: Commit**

```bash
git add api/src/cle api/src/__tests__
git commit -m "$(cat <<'EOF'
feat(api): décommissionnement CLE - suppression des invitations et mises à jour de référents (H17)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Supprimer le routeur `appel-a-projet`

Import et synchronisation de l'appel à projet CLE. Aucun constat d'audit ne le vise, mais c'est de l'administration pure, sans acteur.

**Files:**
- Modify: `api/src/__tests__/cle-routes-supprimees.test.ts`
- Modify: `api/src/cle/index.ts`
- Delete: `api/src/cle/appelAProjetCle/` (dossier complet, 12 fichiers)
- Delete: `api/src/__tests__/phase1/cle/appelAProjet.test.ts`
- Delete: `api/src/__tests__/fixtures/cle/appelAProjet.ts`

**Interfaces:**
- Consumes: `callRoute` et `Method` de la tâche 1.
- Produces: rien.

- [ ] **Step 1: Écrire le test qui échoue**

Ajouter à `api/src/__tests__/cle-routes-supprimees.test.ts` :

```ts
describe("Routes CLE supprimées — appel à projet", () => {
  const routes: [Method, string][] = [
    ["post", "/cle/appel-a-projet/simulate"],
    ["post", "/cle/appel-a-projet/real"],
  ];

  it.each(routes)("%s %s n'est plus montée", async (method, path) => {
    await expectRouteRemoved(method, path);
  });
});
```

- [ ] **Step 2: Lancer le test et vérifier qu'il échoue**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : ÉCHEC sur les 2 cas.

- [ ] **Step 3: Démonter et supprimer le routeur**

Dans `api/src/cle/index.ts`, supprimer la ligne :

```ts
router.use("/appel-a-projet", require("./appelAProjetCle/appelAProjetController").default);
```

Puis :

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
rm -r api/src/cle/appelAProjetCle
rm api/src/__tests__/phase1/cle/appelAProjet.test.ts
rm api/src/__tests__/fixtures/cle/appelAProjet.ts
```

- [ ] **Step 4: Retirer le drapeau de synchronisation**

Dans `packages/lib/src/constants/featureFlags.ts`, supprimer l'entrée :

```ts
SYNC_APPEL_A_PROJET_CLE = "SYNC_APPEL_A_PROJET_CLE",
```

- [ ] **Step 5: Vérifier qu'aucune référence ne subsiste**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
grep -rn "appelAProjet\|appel-a-projet\|SYNC_APPEL_A_PROJET_CLE" api/src admin/src app/src packages/lib/src
```

Attendu : aucun résultat. Si `admin` référence encore l'appel à projet, supprimer l'écran correspondant dans la même tâche.

- [ ] **Step 6: Lancer les tests et vérifier qu'ils passent**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : SUCCÈS.

- [ ] **Step 7: Vérifier le lint et les types**

```bash
cd api && npm run lint && npm run check-types && cd ../admin && npm run check-types
```

- [ ] **Step 8: Commit**

```bash
git add api/src/cle api/src/__tests__ packages/lib/src/constants/featureFlags.ts
git commit -m "$(cat <<'EOF'
feat(api,lib): décommissionnement CLE - suppression de l'import appel à projet

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Migration — retirer les rôles CLE des permissions et forcer `INACTIVE`

Deux effets : plus aucune permission n'est accordée aux rôles CLE, et tout compte CLE qui aurait été réactivé repasse `INACTIVE`.

**Attention** : les permissions portent un tableau `roles` **partagé**. `CLASSE_READ` vaut `[ADMIN, REFERENT_REGION, REFERENT_DEPARTMENT, ADMINISTRATEUR_CLE, REFERENT_CLASSE, TRANSPORTER]`. Il faut retirer les deux rôles CLE du tableau, **jamais** supprimer le document : le détruire couperait la consultation des ADMIN et des référents départementaux et régionaux, c'est-à-dire exactement ce que le lot entend préserver.

**Files:**
- Create: `api/migrations/<horodatage>-decommissionnement-cle-permissions-et-comptes.js`

**Interfaces:**
- Consumes: `PermissionModel` depuis `../src/models/permissions/permission`, `ReferentModel` depuis `../src/models`, `ROLES` et `ReferentStatus` depuis `snu-lib`.
- Produces: rien pour les tâches suivantes.

- [ ] **Step 1: Créer le squelette de migration**

```bash
cd api && npm run migrate-create -- decommissionnement-cle-permissions-et-comptes
```

La commande crée le fichier horodaté dans `api/migrations/`.

- [ ] **Step 2: Écrire la migration**

Remplacer le contenu du fichier créé par :

```js
const { logger } = require("../src/logger");
const { PermissionModel } = require("../src/models/permissions/permission");
const { ReferentModel } = require("../src/models");
const { ROLES, ReferentStatus } = require("snu-lib");

const CLE_ROLES = [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE];

module.exports = {
  async up() {
    logger.info("Décommissionnement CLE - retrait des rôles CLE des permissions");
    const pullResult = await PermissionModel.updateMany({ roles: { $in: CLE_ROLES } }, { $pull: { roles: { $in: CLE_ROLES } } });
    logger.info(`Décommissionnement CLE - ${pullResult.modifiedCount} permission(s) mise(s) à jour`);

    const emptied = await PermissionModel.find({ roles: { $size: 0 } });
    logger.info(`Décommissionnement CLE - ${emptied.length} permission(s) sans rôle restant : ${emptied.map((p) => p.code).join(", ") || "aucune"}`);
    await PermissionModel.deleteMany({ roles: { $size: 0 } });

    logger.info("Décommissionnement CLE - désactivation des comptes CLE restants");
    const stillActive = await ReferentModel.find({
      role: { $in: CLE_ROLES },
      status: { $ne: ReferentStatus.INACTIVE },
    }).cursor({ batchSize: 100 });

    let deactivated = 0;
    // patch library mix up _id when using updatemany and bulk update, so we use a cursor and findByIdAndUpdate instead
    await stillActive.eachAsync(
      async (referent) => {
        await ReferentModel.findByIdAndUpdate({ _id: referent._id }, { $set: { status: ReferentStatus.INACTIVE } }, { new: false });
        deactivated += 1;
      },
      { parallel: 10 },
    );
    logger.info(`Décommissionnement CLE - ${deactivated} compte(s) désactivé(s) (0 attendu)`);
  },

  async down() {
    logger.info("Décommissionnement CLE - pas de retour arrière automatique");
    // Le retour arrière se fait en rejouant les seeds de permissions concernés.
    // Les comptes CLE ne sont pas réactivés : ils étaient déjà INACTIVE avant cette migration
    // (voir 20250804095717-987-desactiver-comptes.js).
  },
};
```

Le commentaire sur le curseur reprend celui de la migration 987 : la bibliothèque de patch mélange les `_id` lors des mises à jour en lot.

- [ ] **Step 3: Vérifier l'état des migrations**

```bash
cd api && npm run migrate-status
```

Attendu : la nouvelle migration apparaît en `PENDING`.

- [ ] **Step 4: Jouer la migration en local et lire les compteurs**

```bash
cd api && npm run migrate-up
```

Attendu : quatre lignes de journal. Le nombre de permissions mises à jour doit être non nul (au moins `CLASSE_READ`). Le nombre de comptes désactivés doit être 0 sur une base saine. Le nombre de permissions vidées doit être 0 ou correspondre à des permissions exclusivement CLE — si une permission attendue par un rôle actif y figure, **arrêter** et revoir.

- [ ] **Step 5: Vérifier que la consultation ADMIN survit**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : SUCCÈS, en particulier les cas « ne répond pas 404 » des tâches 2 à 4.

- [ ] **Step 6: Commit**

```bash
git add api/migrations
git commit -m "$(cat <<'EOF'
feat(api): décommissionnement CLE - retrait des permissions CLE et désactivation des comptes résiduels

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Nettoyer les helpers devenus orphelins dans `packages/lib/src/roles.ts`

Périmètre volontairement restreint, cf. « Écart assumé » en tête de plan : on ne supprime que ce que plus personne n'appelle.

**Files:**
- Modify: `packages/lib/src/roles.ts`
- Modify: `packages/lib/src/roles.spec.ts` (retrait des tests des helpers supprimés)

**Interfaces:**
- Consumes: rien.
- Produces: rien.

- [ ] **Step 1: Établir la liste des helpers devenus non référencés**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
for fn in $(grep -oE "^export (const|function) can[A-Za-z0-9_]+" packages/lib/src/roles.ts | awk '{print $3}'); do
  count=$(grep -rn "\b$fn\b" api/src apiv2/src admin/src app/src packages/lib/src --exclude=roles.ts --exclude=roles.spec.ts | wc -l)
  if [ "$count" -eq 0 ]; then echo "ORPHELIN: $fn"; fi
done
```

Noter la liste obtenue. Elle constitue le périmètre exact de cette tâche — ni plus, ni moins.

- [ ] **Step 2: Écrire le test qui échoue**

Pour **chaque** helper listé à l'étape 1, ajouter dans `packages/lib/src/roles.spec.ts` :

```ts
it("n'exporte plus les helpers d'administration CLE supprimés", async () => {
  const roles = await import("./roles");
  // Remplacer par la liste exacte obtenue à l'étape 1
  expect(roles).not.toHaveProperty("canCreateClasse");
  expect(roles).not.toHaveProperty("canUpdateClasse");
});
```

Adapter les noms à la liste réelle. Ne pas inventer de nom : si l'étape 1 ne renvoie rien, passer directement à l'étape 6 et signaler que la tâche est sans objet.

- [ ] **Step 3: Lancer le test et vérifier qu'il échoue**

```bash
cd packages/lib && npx jest src/roles.spec.ts --silent
```

Attendu : ÉCHEC, les helpers existent encore.

- [ ] **Step 4: Supprimer les helpers orphelins**

Dans `packages/lib/src/roles.ts`, supprimer la définition de chaque helper listé, puis son entrée dans l'export groupé en fin de fichier s'il y figure.

- [ ] **Step 5: Lancer le test et vérifier qu'il passe**

```bash
cd packages/lib && npx jest src/roles.spec.ts --silent
```

Attendu : SUCCÈS.

- [ ] **Step 6: Vérifier l'ensemble du monorepo**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
cd packages/lib && npm run build && cd ../../api && npm run check-types && cd ../admin && npm run check-types && cd ../app && npm run check-types
```

Attendu : aucune erreur.

- [ ] **Step 7: Commit**

```bash
git add packages/lib/src/roles.ts packages/lib/src/roles.spec.ts
git commit -m "$(cat <<'EOF'
refactor(lib): décommissionnement CLE - suppression des helpers d'autorisation devenus inutilisés

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Retirer les commandes d'écriture du front admin

Les écrans `Classes` et `Établissement` restent accessibles en consultation aux `ADMIN`, `REFERENT_DEPARTMENT` et `REFERENT_REGION`. Seules disparaissent les actions qui appellent les routes supprimées aux tâches 2 à 4.

**Files:**
- Delete: `admin/src/scenes/classe/create.tsx`, `admin/src/scenes/classe/components/WithdrawButton.tsx`, `admin/src/scenes/classe/header/DeleteButton.tsx`, `admin/src/scenes/classe/header/VerifClassButton.tsx`, `admin/src/scenes/classe/header/ButtonRelanceVerif.tsx`, `admin/src/scenes/classe/header/ButtonCertificateDownload.tsx`, `admin/src/scenes/classe/header/ButtonLinkInvite.tsx`, `admin/src/scenes/classe/components/ReferentInfosModifierModal.tsx`, `admin/src/scenes/classe/components/ReferentInfosConfirmerModal.tsx`
- Delete: `admin/src/scenes/etablissement/Create/` (dossier complet), `admin/src/scenes/etablissement/components/ButtonAddCoordinator.tsx`, `admin/src/scenes/etablissement/components/ButtonDeleteCoordinator.tsx`, `admin/src/scenes/etablissement/components/ButtonEditChefEtablissement.tsx`
- Modify: `admin/src/scenes/classe/header/index.tsx`, `admin/src/scenes/classe/header/ClasseHeader.tsx`, `admin/src/scenes/classe/components/ReferentInfos.tsx`, `admin/src/scenes/classe/index.tsx`, `admin/src/scenes/classe/view/index.tsx`
- Modify: `admin/src/scenes/etablissement/view.tsx`, `admin/src/scenes/etablissement/index.jsx`, `admin/src/scenes/etablissement/components/Contact.tsx`

**Interfaces:**
- Consumes: les routes supprimées aux tâches 2 à 4 — aucune ne doit plus être appelée.
- Produces: rien.

- [ ] **Step 1: Établir la liste exacte des appels à supprimer**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
grep -rn "api.post(\`/cle/\|api.put(\`/cle/\|api.remove(\`/cle/\|api.post(\"/cle/\|api.put(\"/cle/" admin/src
```

Chaque résultat pointe une commande d'écriture à retirer. La liste doit correspondre aux fichiers ci-dessus ; tout écart est à instruire avant de continuer.

- [ ] **Step 2: Supprimer les composants de commande**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
rm admin/src/scenes/classe/create.tsx \
   admin/src/scenes/classe/components/WithdrawButton.tsx \
   admin/src/scenes/classe/components/ReferentInfosModifierModal.tsx \
   admin/src/scenes/classe/components/ReferentInfosConfirmerModal.tsx \
   admin/src/scenes/classe/header/DeleteButton.tsx \
   admin/src/scenes/classe/header/VerifClassButton.tsx \
   admin/src/scenes/classe/header/ButtonRelanceVerif.tsx \
   admin/src/scenes/classe/header/ButtonCertificateDownload.tsx \
   admin/src/scenes/classe/header/ButtonLinkInvite.tsx
rm -r admin/src/scenes/etablissement/Create
rm admin/src/scenes/etablissement/components/ButtonAddCoordinator.tsx \
   admin/src/scenes/etablissement/components/ButtonDeleteCoordinator.tsx \
   admin/src/scenes/etablissement/components/ButtonEditChefEtablissement.tsx
```

- [ ] **Step 3: Retirer les points de montage**

Dans chaque fichier de la liste `Modify`, supprimer l'import et l'usage JSX du composant supprimé. Les vues de liste, de détail, l'historique et les statistiques restent intacts. Supprimer aussi la route de création de classe dans `admin/src/app.tsx` si elle pointe vers `scenes/classe/create`.

- [ ] **Step 4: Vérifier qu'aucun appel d'écriture ne subsiste**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
grep -rn "api.post(\`/cle/\|api.put(\`/cle/\|api.remove(\`/cle/" admin/src
```

Attendu : aucun résultat. Les appels `api.post(\`/elasticsearch/cle/…\`)` sont des **lectures** et doivent rester.

- [ ] **Step 5: Vérifier les types et la compilation**

```bash
cd admin && npm run check-types && npm run build
```

Attendu : aucune erreur, aucun import orphelin.

- [ ] **Step 6: Vérifier l'écran à la main**

Lancer `admin` en local, se connecter avec un compte `ADMIN`, ouvrir `/classes` puis une classe et un établissement. Attendu : les listes, le détail, l'historique et les statistiques s'affichent ; aucun bouton de création, modification, vérification, désistement, suppression ni invitation n'est présent ; aucune erreur en console.

- [ ] **Step 7: Commit**

```bash
git add admin/src
git commit -m "$(cat <<'EOF'
feat(admin): décommissionnement CLE - retrait des commandes d'écriture sur les classes et établissements

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

## Vérification finale avant la PR

- [ ] **Suite complète api**

```bash
cd api && npm test
```

Attendu : SUCCÈS. Aucun test ne doit avoir été désactivé plutôt que supprimé.

- [ ] **Types sur tout le monorepo**

```bash
cd /Users/pam/Sites/betagouv/service-national-universel
cd packages/lib && npm run build && cd ../../api && npm run check-types && cd ../admin && npm run check-types && cd ../app && npm run check-types
```

- [ ] **Aucune route d'administration CLE ne répond**

```bash
cd api && npx jest src/__tests__/cle-routes-supprimees.test.ts --silent --testTimeout=60000 --maxWorkers=1
```

Attendu : SUCCÈS sur les 24 cas de suppression (5 signup, 7 classe, 4 établissement, 6 référent et classes, 2 appel à projet) et sur les 5 gardes-fous de consultation.

- [ ] **Description de la PR** — y consigner les deux résultats du préalable bloquant (comptage §7.1, relevé de trafic §7.2), et lister les constats fermés : H8, H10, H11, H12, H13, H15, H16, H17, H19, H20. Préciser que C1, C3, H9, H14, H18 et L4 restent ouverts et relèvent du lot 1b.
