# Export volontaires opt-out 2024-2025 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produire un script Effect TS autonome qui, pour une liste d'emails de volontaires, exporte en Excel (un onglet par modèle) les données des modèles liés + les représentants légaux (email + prénom), en lecture seule sur Mongo prod.

**Architecture:** Script one-shot `api/src/scripts/exportOptoutVolontaires.effect.ts` sur le patron des runners existants (`anonymizeInactiveCohortYoungs.effect.ts`, `exportOldCohortSupportEmails.ts`) : `Effect.acquireUseRelease(initDB, program, closeDB)`. La logique pure (normalisation, sélection de champs, construction de lignes) est isolée dans `exportOptoutVolontaires.helpers.ts` + config `exportOptoutVolontaires.fields.ts`, testables sans Mongo. L'écriture Excel se fait **en streaming** via `exceljs` (`stream.xlsx.WorkbookWriter`) pour éviter l'OOM connu à ~47k volontaires (SheetJS construit tout en mémoire). La lecture du fichier d'emails (48k lignes, 1 colonne) reste sur SheetJS (`xlsx`, déjà dépendance d'`api`) — lire est bon marché, seul l'écriture volumineuse pose problème.

**Tech Stack:** TypeScript, Effect (`effect`), Mongoose (models `api/src/models`), `xlsx` (lecture entrée), `exceljs` (écriture streaming), Jest + ts-jest (tests), `tsx` (exécution).

## Global Constraints

- **Lecture seule stricte** : aucune écriture Mongo (`find(...).lean()` uniquement ; jamais `update`/`save`/`replaceOne`/`deleteX`).
- **Projection stricte** : ne lire que les champs exportés (+ clés de jointure `_id`, `classeId`, `etablissementId`, `youngId`, `missionId`, `apiEngagementId`). Pas de PII hors périmètre.
- **Effect idioms** : programme principal en `Effect.gen` / `Effect.tryPromise` ; ressource DB via `Effect.acquireUseRelease` ; erreurs via `Data.TaggedError` si besoin.
- **Correspondance** : par email fourni, **toutes cohortes** (la liste EST le filtre). Normalisation email = `trim().toLowerCase()`.
- **Modèles inclus (7 onglets)** : `young`, `application`, `missionequivalence`, `mission`, `etablissement`, `classe`, `missionapi`. **Exclus** : `area`, `importplandetransport`.
- **Représentants légaux** : `parent1Email`, `parent1FirstName`, `parent2Email`, `parent2FirstName` (colonnes de l'onglet Young).
- **Limite cellule Excel** : 32 767 caractères — les valeurs sérialisées sont plafonnées.
- **Chunking** : requêtes `$in` par paquets (défaut 1000, `CHUNK` overridable).
- **Exécution** depuis `api/` avec `tsx`. Env : `EMAILS_FILE`, `OUT_FILE`, `CHUNK`, `LIMIT`, `DRY_RUN`.

## Prérequis (avant de commencer)

1. **Brancher depuis `main`** (ou une base à jour). Le worktree courant (`feat/remove-yellow-rows-5b76ab`) est en retard et ne contient pas toute la tooling d'anonymisation. Vérifier la présence de `api/src/scripts/anonymizeInactiveCohortYoungs.effect.ts` et `api/src/models/index.ts` exportant `MissionModel, MissionAPIModel, ClasseModel, EtablissementModel`.
2. **snu-lib buildé** dans le worktree (cf. setup worktree : symlink node_modules + build `packages/lib`), sinon les imports `../models` cassent.
3. **`exceljs@4.4.0`** est déjà hoisté dans le `node_modules` racine du monorepo (dépendance d'`apiv2`) : résolvable au runtime depuis `api` via `tsx`. La Tâche 1 le déclare dans `api/package.json` **sans lancer d'install** (le paquet est déjà présent — éviter tout `npm install -w api` qui peut effacer `packages/lib/dist`).
4. Accès Mongo prod **lecture seule** configuré comme pour les scripts existants (mêmes variables que `initDB`).

## File Structure

- `api/src/scripts/exportOptoutVolontaires.fields.ts` — **Create.** Config statique `MODEL_FIELDS` (modèle → champs, depuis le dico) + `YOUNG_REPRESENTATIVE_FIELDS`. Aucune logique.
- `api/src/scripts/exportOptoutVolontaires.helpers.ts` — **Create.** Fonctions pures : `normalizeEmail`, `chunk`, `getByPath`, `toCell`, `buildProjection`, `youngColumns`, `modelColumns`, `buildRow`. Testables sans Mongo.
- `api/src/scripts/exportOptoutVolontaires.queries.ts` — **Create.** Couche d'accès Mongo lecture seule (chunk + projection + `.lean()`), une fonction par modèle.
- `api/src/scripts/exportOptoutVolontaires.workbook.ts` — **Create.** Wrapper `exceljs` streaming (ouvrir/écrire/committer les onglets).
- `api/src/scripts/exportOptoutVolontaires.effect.ts` — **Create.** Programme Effect : lit les emails, orchestre les requêtes, écrit en streaming, produit le rapport.
- `api/package.json` — **Modify.** Déclarer `"exceljs": "^4.4.0"` (sans install).
- `api/src/__tests__/exportOptoutVolontaires.helpers.test.ts` — **Create.** Tests unitaires purs (config + helpers + workbook round-trip).
- `api/src/__tests__/exportOptoutVolontaires.queries.test.ts` — **Create.** Test d'intégration DB (linkage young/application/mission) avec `dbConnect`/`dbClose` + fixtures.

---

## Task 1: Config des champs + déclaration exceljs

**Files:**
- Create: `api/src/scripts/exportOptoutVolontaires.fields.ts`
- Modify: `api/package.json` (ajouter `"exceljs": "^4.4.0"` dans `dependencies`, à côté de `"xlsx"`)
- Test: `api/src/__tests__/exportOptoutVolontaires.helpers.test.ts`

**Interfaces:**
- Produces:
  - `export const MODEL_FIELDS: Record<"young"|"application"|"missionEquivalence"|"mission"|"etablissement"|"classe"|"missionAPI", string[]>`
  - `export const YOUNG_REPRESENTATIVE_FIELDS: string[]`
  - `export const EXPORT_MODELS: Array<keyof typeof MODEL_FIELDS>` (ordre des onglets)

- [ ] **Step 1: Write the failing test**

```ts
// api/src/__tests__/exportOptoutVolontaires.helpers.test.ts
import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS, EXPORT_MODELS } from "../scripts/exportOptoutVolontaires.fields";

describe("exportOptoutVolontaires.fields", () => {
  it("couvre exactement les 7 modèles liés, sans area ni importplandetransport", () => {
    expect(EXPORT_MODELS).toEqual(["young", "application", "missionEquivalence", "mission", "etablissement", "classe", "missionAPI"]);
    expect(Object.keys(MODEL_FIELDS).sort()).toEqual([...EXPORT_MODELS].sort());
    expect(EXPORT_MODELS).not.toContain("area");
    expect(EXPORT_MODELS).not.toContain("importplandetransport");
  });

  it("a le bon nombre de champs par modèle (verrou dico sans lignes jaunes)", () => {
    expect(MODEL_FIELDS.young).toHaveLength(11);
    expect(MODEL_FIELDS.application).toHaveLength(17);
    expect(MODEL_FIELDS.missionEquivalence).toHaveLength(14);
    expect(MODEL_FIELDS.mission).toHaveLength(40);
    expect(MODEL_FIELDS.etablissement).toHaveLength(7);
    expect(MODEL_FIELDS.classe).toHaveLength(5);
    expect(MODEL_FIELDS.missionAPI).toHaveLength(26);
  });

  it("expose les 4 champs représentants légaux", () => {
    expect(YOUNG_REPRESENTATIVE_FIELDS).toEqual(["parent1Email", "parent1FirstName", "parent2Email", "parent2FirstName"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && npx jest exportOptoutVolontaires.helpers -t "fields" -c jest.config.js`
Expected: FAIL — `Cannot find module '../scripts/exportOptoutVolontaires.fields'`

- [ ] **Step 3: Create the config file**

```ts
// api/src/scripts/exportOptoutVolontaires.fields.ts
/**
 * Champs à exporter par modèle — extraits du dictionnaire
 * "Champs_SNU_juillet2026_sans_lignes_jaunes.xlsx" (version sans lignes jaunes).
 * `area` (cityCode) et `importplandetransport` (cohort) exclus : non rattachables à un young.
 * Les champs imbriqués sont notés en chemin ("location.lat") — cf. getByPath.
 */
export const MODEL_FIELDS = {
  young: ["birthdateAt", "domains", "email", "employed", "engaged", "engagedDescription", "engagedStructure", "firstName", "gender", "grade", "qpv"],
  application: ["createdAt", "feedBackExperienceFiles", "hidden", "isJvaMission", "missionDepartment", "missionDuration", "missionName", "missionRegion", "priority", "status", "updatedAt", "youngBirthdateAt", "youngCity", "youngCohort", "youngDepartment", "youngEmail", "youngFirstName"],
  missionEquivalence: ["address", "city", "createdAt", "desc", "endDate", "frequency", "missionDuration", "sousType", "startDate", "status", "structureName", "type", "updatedAt", "zip"],
  mission: ["actions", "address", "addressVerified", "apiEngagementId", "applicationStatus", "city", "contraintes", "country", "createdAt", "department", "description", "domains", "duration", "endAt", "format", "frequence", "hebergement", "hebergementPayant", "isJvaMission", "isMilitaryPreparation", "justifications", "jvaMissionId", "jvaRawData", "lastSyncAt", "location.lat", "location.lon", "mainDomain", "name", "pendingApplications", "period", "placesStatus", "region", "remote", "startAt", "status", "structureName", "subPeriod", "updatedAt", "visibility", "zip"],
  etablissement: ["academy", "city", "department", "region", "schoolYears", "type", "zip"],
  classe: ["department", "filiere", "grade", "grades", "schoolYear"],
  missionAPI: ["adresse", "applicationUrl", "city", "country", "createdAt", "departmentCode", "departmentName", "description", "domain", "endAt", "format", "lastSyncAt", "location.lat", "location.lon", "organizationName", "places", "postalCode", "publisherName", "publisherUrl", "region", "remote", "startAt", "status", "structureName", "title", "updatedAt"],
} as const;

export const YOUNG_REPRESENTATIVE_FIELDS = ["parent1Email", "parent1FirstName", "parent2Email", "parent2FirstName"];

export const EXPORT_MODELS = ["young", "application", "missionEquivalence", "mission", "etablissement", "classe", "missionAPI"] as const;
```

- [ ] **Step 4: Declare exceljs in api/package.json (NO install)**

Add the line to `dependencies` (alphabetical, near `"xlsx"`). The package already exists in the root `node_modules`, so **do not run npm/bun install**.

```jsonc
// api/package.json  (dependencies)
"exceljs": "^4.4.0",
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd api && npx jest exportOptoutVolontaires.helpers -t "fields" -c jest.config.js`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add api/src/scripts/exportOptoutVolontaires.fields.ts api/package.json api/src/__tests__/exportOptoutVolontaires.helpers.test.ts
git commit -m "feat(api): champs & deps export volontaires opt-out"
```

---

## Task 2: Helpers purs (normalizeEmail, chunk, getByPath, toCell, buildProjection)

**Files:**
- Create: `api/src/scripts/exportOptoutVolontaires.helpers.ts`
- Test: `api/src/__tests__/exportOptoutVolontaires.helpers.test.ts` (ajouts)

**Interfaces:**
- Produces:
  - `export function normalizeEmail(raw: unknown): string` — `""` si non-string.
  - `export function chunk<T>(arr: T[], size: number): T[][]`
  - `export function getByPath(obj: any, path: string): unknown` — supporte `"location.lat"`.
  - `export function toCell(value: unknown): string | number | boolean | Date | null` — plafond 32767 car.
  - `export function buildProjection(fields: string[]): Record<string, 1>` — clé = 1er segment du chemin.

- [ ] **Step 1: Write the failing tests**

```ts
// append to api/src/__tests__/exportOptoutVolontaires.helpers.test.ts
import { normalizeEmail, chunk, getByPath, toCell, buildProjection } from "../scripts/exportOptoutVolontaires.helpers";

describe("normalizeEmail", () => {
  it("trim + lowercase", () => expect(normalizeEmail("  Foo@Bar.FR ")).toBe("foo@bar.fr"));
  it("non-string -> ''", () => expect(normalizeEmail(undefined)).toBe(""));
});

describe("chunk", () => {
  it("découpe par taille", () => expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]));
  it("tableau vide -> []", () => expect(chunk([], 3)).toEqual([]));
});

describe("getByPath", () => {
  it("chemin simple", () => expect(getByPath({ a: 1 }, "a")).toBe(1));
  it("chemin imbriqué", () => expect(getByPath({ location: { lat: 48.8 } }, "location.lat")).toBe(48.8));
  it("segment manquant -> undefined", () => expect(getByPath({}, "location.lat")).toBeUndefined());
});

describe("toCell", () => {
  it("passe les primitives", () => {
    expect(toCell("x")).toBe("x");
    expect(toCell(3)).toBe(3);
    expect(toCell(true)).toBe(true);
    const d = new Date("2024-01-01"); expect(toCell(d)).toBe(d);
  });
  it("null/undefined -> null", () => { expect(toCell(null)).toBeNull(); expect(toCell(undefined)).toBeNull(); });
  it("tableau/objet -> JSON", () => {
    expect(toCell(["a", "b"])).toBe('["a","b"]');
    expect(toCell({ k: 1 })).toBe('{"k":1}');
  });
  it("plafonne à 32767 caractères", () => {
    const big = "a".repeat(40000);
    const out = toCell(big) as string;
    expect(out.length).toBe(32767);
  });
});

describe("buildProjection", () => {
  it("réduit les chemins au 1er segment", () => {
    expect(buildProjection(["email", "location.lat", "location.lon"])).toEqual({ email: 1, location: 1 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd api && npx jest exportOptoutVolontaires.helpers -c jest.config.js`
Expected: FAIL — `Cannot find module '../scripts/exportOptoutVolontaires.helpers'`

- [ ] **Step 3: Implement the helpers**

```ts
// api/src/scripts/exportOptoutVolontaires.helpers.ts
const EXCEL_CELL_MAX = 32767;

export function normalizeEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function getByPath(obj: any, path: string): unknown {
  return path.split(".").reduce((acc, seg) => (acc == null ? undefined : acc[seg]), obj);
}

export function toCell(value: unknown): string | number | boolean | Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return typeof value === "string" && value.length > EXCEL_CELL_MAX ? value.slice(0, EXCEL_CELL_MAX) : value;
  }
  const json = JSON.stringify(value) ?? "";
  return json.length > EXCEL_CELL_MAX ? json.slice(0, EXCEL_CELL_MAX) : json;
}

export function buildProjection(fields: string[]): Record<string, 1> {
  const proj: Record<string, 1> = {};
  for (const f of fields) proj[f.split(".")[0]] = 1;
  return proj;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && npx jest exportOptoutVolontaires.helpers -c jest.config.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/src/scripts/exportOptoutVolontaires.helpers.ts api/src/__tests__/exportOptoutVolontaires.helpers.test.ts
git commit -m "feat(api): helpers purs export volontaires opt-out"
```

---

## Task 3: Colonnes & construction de ligne (buildRow)

**Files:**
- Modify: `api/src/scripts/exportOptoutVolontaires.helpers.ts`
- Test: `api/src/__tests__/exportOptoutVolontaires.helpers.test.ts` (ajouts)

**Interfaces:**
- Consumes: `MODEL_FIELDS`, `YOUNG_REPRESENTATIVE_FIELDS` (Task 1) ; `getByPath`, `toCell` (Task 2).
- Produces:
  - `export function youngColumns(): string[]` — `[...MODEL_FIELDS.young, ...YOUNG_REPRESENTATIVE_FIELDS]`
  - `export function modelColumns(model): string[]` — `["youngEmail", ...MODEL_FIELDS[model]]` (traçabilité en 1re colonne)
  - `export function buildRow(doc: Record<string, any>, columns: string[]): Record<string, string | number | boolean | Date | null>`

- [ ] **Step 1: Write the failing tests**

```ts
// append to api/src/__tests__/exportOptoutVolontaires.helpers.test.ts
import { youngColumns, modelColumns, buildRow } from "../scripts/exportOptoutVolontaires.helpers";

describe("colonnes", () => {
  it("young = champs young + représentants", () => {
    expect(youngColumns()).toEqual(["birthdateAt", "domains", "email", "employed", "engaged", "engagedDescription", "engagedStructure", "firstName", "gender", "grade", "qpv", "parent1Email", "parent1FirstName", "parent2Email", "parent2FirstName"]);
  });
  it("modèle lié = youngEmail en tête puis champs", () => {
    expect(modelColumns("classe")).toEqual(["youngEmail", "department", "filiere", "grade", "grades", "schoolYear"]);
  });
});

describe("buildRow", () => {
  it("young : champs plats, imbriqués, tableaux, représentants", () => {
    const doc = { email: "a@b.fr", firstName: "Léa", domains: ["Défense", "Santé"], parent1Email: "p1@b.fr", parent1FirstName: "Papa", parent2Email: null };
    const row = buildRow(doc, youngColumns());
    expect(row.email).toBe("a@b.fr");
    expect(row.domains).toBe('["Défense","Santé"]');
    expect(row.parent1FirstName).toBe("Papa");
    expect(row.parent2Email).toBeNull();
    expect(row.gender).toBeNull(); // absent -> null
  });
  it("modèle : injecte youngEmail + chemin imbriqué location.lat", () => {
    const doc = { youngEmail: "a@b.fr", name: "Mission X", location: { lat: 48.8, lon: 2.3 } };
    const row = buildRow(doc, modelColumns("mission"));
    expect(row.youngEmail).toBe("a@b.fr");
    expect(row.name).toBe("Mission X");
    expect(row["location.lat"]).toBe(48.8);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd api && npx jest exportOptoutVolontaires.helpers -t "buildRow|colonnes" -c jest.config.js`
Expected: FAIL — `youngColumns is not a function` (module manque les exports)

- [ ] **Step 3: Implement**

```ts
// append to api/src/scripts/exportOptoutVolontaires.helpers.ts
import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS } from "./exportOptoutVolontaires.fields";

export function youngColumns(): string[] {
  return [...MODEL_FIELDS.young, ...YOUNG_REPRESENTATIVE_FIELDS];
}

export function modelColumns(model: Exclude<keyof typeof MODEL_FIELDS, "young">): string[] {
  return ["youngEmail", ...MODEL_FIELDS[model]];
}

export function buildRow(doc: Record<string, any>, columns: string[]): Record<string, string | number | boolean | Date | null> {
  const row: Record<string, string | number | boolean | Date | null> = {};
  for (const col of columns) row[col] = toCell(getByPath(doc, col));
  return row;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd api && npx jest exportOptoutVolontaires.helpers -c jest.config.js`
Expected: PASS (tous les blocs du fichier)

- [ ] **Step 5: Commit**

```bash
git add api/src/scripts/exportOptoutVolontaires.helpers.ts api/src/__tests__/exportOptoutVolontaires.helpers.test.ts
git commit -m "feat(api): colonnes & buildRow export volontaires opt-out"
```

---

## Task 4: Wrapper Excel streaming (exceljs)

**Files:**
- Create: `api/src/scripts/exportOptoutVolontaires.workbook.ts`
- Test: `api/src/__tests__/exportOptoutVolontaires.helpers.test.ts` (ajout d'un bloc round-trip)

**Interfaces:**
- Produces:
  - `export function createExportWorkbook(outFile: string): ExportWorkbook`
  - `type ExportWorkbook = { openSheet(name, columns: string[]): void; writeRow(name, row: Record<string, any>): void; commitSheet(name): Promise<void>; commit(): Promise<void> }`

- [ ] **Step 1: Write the failing round-trip test**

Écrit deux onglets en streaming puis relit avec SheetJS (`xlsx`, déjà dispo) pour vérifier onglets + contenu.

```ts
// append to api/src/__tests__/exportOptoutVolontaires.helpers.test.ts
import { tmpdir } from "os";
import { join } from "path";
import * as fs from "fs";
import * as XLSX from "xlsx";
import { createExportWorkbook } from "../scripts/exportOptoutVolontaires.workbook";

describe("createExportWorkbook (streaming round-trip)", () => {
  it("écrit des onglets relisibles avec les bonnes valeurs", async () => {
    const out = join(tmpdir(), `export-test-${process.pid}.xlsx`);
    const wb = createExportWorkbook(out);
    wb.openSheet("Young", ["email", "firstName"]);
    wb.openSheet("Classe", ["youngEmail", "department"]);
    wb.writeRow("Young", { email: "a@b.fr", firstName: "Léa" });
    wb.writeRow("Classe", { youngEmail: "a@b.fr", department: "75" });
    await wb.commitSheet("Young");
    await wb.commitSheet("Classe");
    await wb.commit();

    const read = XLSX.readFile(out);
    expect(read.SheetNames).toEqual(["Young", "Classe"]);
    const young = XLSX.utils.sheet_to_json(read.Sheets.Young);
    expect(young).toEqual([{ email: "a@b.fr", firstName: "Léa" }]);
    const classe = XLSX.utils.sheet_to_json(read.Sheets.Classe);
    expect(classe).toEqual([{ youngEmail: "a@b.fr", department: "75" }]);
    fs.unlinkSync(out);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd api && npx jest exportOptoutVolontaires.helpers -t "round-trip" -c jest.config.js`
Expected: FAIL — `Cannot find module '../scripts/exportOptoutVolontaires.workbook'`

- [ ] **Step 3: Implement the wrapper**

```ts
// api/src/scripts/exportOptoutVolontaires.workbook.ts
import * as ExcelJS from "exceljs";

export type ExportWorkbook = {
  openSheet(name: string, columns: string[]): void;
  writeRow(name: string, row: Record<string, any>): void;
  commitSheet(name: string): Promise<void>;
  commit(): Promise<void>;
};

/**
 * Écriture Excel en streaming (faible mémoire) : chaque ligne est flushée
 * immédiatement (row.commit()), chaque onglet est finalisé via commitSheet().
 * Évite l'OOM connu à ~47k volontaires (SheetJS construit tout en mémoire).
 */
export function createExportWorkbook(outFile: string): ExportWorkbook {
  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: outFile });
  const sheets = new Map<string, ExcelJS.Worksheet>();
  return {
    openSheet(name, columns) {
      const ws = workbook.addWorksheet(name);
      ws.columns = columns.map((c) => ({ header: c, key: c }));
      sheets.set(name, ws);
    },
    writeRow(name, row) {
      const ws = sheets.get(name);
      if (!ws) throw new Error(`Onglet inconnu: ${name}`);
      ws.addRow(row).commit();
    },
    async commitSheet(name) {
      const ws = sheets.get(name);
      if (!ws) throw new Error(`Onglet inconnu: ${name}`);
      await ws.commit();
    },
    async commit() {
      await workbook.commit();
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd api && npx jest exportOptoutVolontaires.helpers -t "round-trip" -c jest.config.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add api/src/scripts/exportOptoutVolontaires.workbook.ts api/src/__tests__/exportOptoutVolontaires.helpers.test.ts
git commit -m "feat(api): wrapper excel streaming export volontaires opt-out"
```

---

## Task 5: Couche d'accès Mongo lecture seule (chunk + projection)

**Files:**
- Create: `api/src/scripts/exportOptoutVolontaires.queries.ts`
- Test: `api/src/__tests__/exportOptoutVolontaires.queries.test.ts`

**Interfaces:**
- Consumes: `MODEL_FIELDS`, `YOUNG_REPRESENTATIVE_FIELDS` (Task 1) ; `chunk`, `buildProjection` (Task 2) ; models de `../models`.
- Produces (toutes retournent des objets `.lean()`, lecture seule) :
  - `findYoungsByEmails(emails: string[], chunkSize: number): Promise<any[]>` — projette champs young + représentants + `_id, classeId, etablissementId`.
  - `findApplicationsByYoungIds(youngIds: string[], chunkSize): Promise<any[]>`
  - `findEquivalencesByYoungIds(youngIds: string[], chunkSize): Promise<any[]>`
  - `findMissionsByIds(missionIds: string[], chunkSize): Promise<any[]>` — projette champs mission + `apiEngagementId`.
  - `findEtablissementsByIds(ids: string[], chunkSize): Promise<any[]>`
  - `findClassesByIds(ids: string[], chunkSize): Promise<any[]>`
  - `findMissionAPIByIds(ids: string[], chunkSize): Promise<any[]>`

- [ ] **Step 1: VÉRIFIER la clé de jointure MissionAPI (lecture seule, prod ou dump)**

Avant de coder l'onglet MissionAPI, confirmer comment `mission` référence `missionApi`. Piste connue (`api/src/application/applicationController.ts:197`) : « `mission.apiEngagementId` représente l'ID de la MISSION dans l'API Engagement ». Exécuter en lecture seule :

```bash
cd api && npx tsx -e '
import { initDB, closeDB } from "./src/mongo";
import { MissionModel, MissionAPIModel } from "./src/models";
(async () => { await initDB();
  const m = await MissionModel.findOne({ apiEngagementId: { $exists: true, $ne: null } }, { apiEngagementId: 1, jvaMissionId: 1 }).lean();
  console.log("mission.apiEngagementId:", (m as any)?.apiEngagementId);
  const byId = await MissionAPIModel.findById((m as any)?.apiEngagementId, { _id: 1 }).lean();
  console.log("MissionAPI._id == apiEngagementId ?", !!byId);
  await closeDB();
})();'
```

Si `MissionAPI._id == apiEngagementId` → jointure par `_id` (défaut du code ci-dessous). Sinon, adapter `findMissionAPIByIds` au champ correct et le noter ici. Si aucune correspondance fiable → onglet MissionAPI best-effort (peut être vide), documenté dans le rapport.

- [ ] **Step 2: Write the failing integration test**

```ts
// api/src/__tests__/exportOptoutVolontaires.queries.test.ts
import { dbConnect, dbClose } from "./helpers/db";
import { YoungModel, ApplicationModel } from "../models";
import { findYoungsByEmails, findApplicationsByYoungIds } from "../scripts/exportOptoutVolontaires.queries";

beforeAll(async () => { await dbConnect(__filename.slice(__dirname.length + 1, -3)); });
afterAll(dbClose);

describe("queries export opt-out (lecture seule)", () => {
  it("findYoungsByEmails matche par email normalisé et projette les champs voulus", async () => {
    const y = await YoungModel.create({ email: "Case@B.fr", firstName: "Léa", parent1Email: "p1@b.fr", lastName: "SECRET" });
    const res = await findYoungsByEmails(["case@b.fr"], 1000);
    expect(res).toHaveLength(1);
    expect(res[0].firstName).toBe("Léa");
    expect(res[0].parent1Email).toBe("p1@b.fr");
    expect(res[0].lastName).toBeUndefined(); // hors projection -> non lu
    await YoungModel.deleteOne({ _id: y._id });
  });

  it("findApplicationsByYoungIds retourne les candidatures liées", async () => {
    const y = await YoungModel.create({ email: "app@b.fr", firstName: "Tom" });
    const a = await ApplicationModel.create({ youngId: String(y._id), youngEmail: "app@b.fr", missionId: "MID1", status: "WAITING_VALIDATION" });
    const res = await findApplicationsByYoungIds([String(y._id)], 1000);
    expect(res.map((r: any) => r.missionId)).toContain("MID1");
    await ApplicationModel.deleteOne({ _id: a._id });
    await YoungModel.deleteOne({ _id: y._id });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd api && npx jest exportOptoutVolontaires.queries -c jest.config.js`
Expected: FAIL — `Cannot find module '../scripts/exportOptoutVolontaires.queries'`

- [ ] **Step 4: Implement the query layer**

```ts
// api/src/scripts/exportOptoutVolontaires.queries.ts
import { YoungModel, ApplicationModel, MissionEquivalenceModel, MissionModel, EtablissementModel, ClasseModel, MissionAPIModel } from "../models";
import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS } from "./exportOptoutVolontaires.fields";
import { chunk, buildProjection } from "./exportOptoutVolontaires.helpers";

async function findByIn(model: any, field: string, values: string[], projection: Record<string, 1>, chunkSize: number): Promise<any[]> {
  const out: any[] = [];
  for (const part of chunk(values, chunkSize)) {
    if (part.length === 0) continue;
    const docs = await model.find({ [field]: { $in: part } }, projection).lean(); // lecture seule
    out.push(...docs);
  }
  return out;
}

export function findYoungsByEmails(emails: string[], chunkSize: number) {
  const proj = { ...buildProjection([...MODEL_FIELDS.young, ...YOUNG_REPRESENTATIVE_FIELDS]), _id: 1, classeId: 1, etablissementId: 1 } as Record<string, 1>;
  return findByIn(YoungModel, "email", emails, proj, chunkSize);
}
export function findApplicationsByYoungIds(youngIds: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.application), _id: 1, youngId: 1, missionId: 1 } as Record<string, 1>;
  return findByIn(ApplicationModel, "youngId", youngIds, proj, chunkSize);
}
export function findEquivalencesByYoungIds(youngIds: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.missionEquivalence), _id: 1, youngId: 1 } as Record<string, 1>;
  return findByIn(MissionEquivalenceModel, "youngId", youngIds, proj, chunkSize);
}
export function findMissionsByIds(missionIds: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.mission), _id: 1, apiEngagementId: 1 } as Record<string, 1>;
  return findByIn(MissionModel, "_id", missionIds, proj, chunkSize);
}
export function findEtablissementsByIds(ids: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.etablissement), _id: 1 } as Record<string, 1>;
  return findByIn(EtablissementModel, "_id", ids, proj, chunkSize);
}
export function findClassesByIds(ids: string[], chunkSize: number) {
  const proj = { ...buildProjection(MODEL_FIELDS.classe), _id: 1 } as Record<string, 1>;
  return findByIn(ClasseModel, "_id", ids, proj, chunkSize);
}
export function findMissionAPIByIds(ids: string[], chunkSize: number) {
  // Jointure confirmée en Step 1 (défaut : MissionAPI._id == mission.apiEngagementId).
  const proj = { ...buildProjection(MODEL_FIELDS.missionAPI), _id: 1 } as Record<string, 1>;
  return findByIn(MissionAPIModel, "_id", ids, proj, chunkSize);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd api && npx jest exportOptoutVolontaires.queries -c jest.config.js`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add api/src/scripts/exportOptoutVolontaires.queries.ts api/src/__tests__/exportOptoutVolontaires.queries.test.ts
git commit -m "feat(api): couche requêtes lecture seule export volontaires opt-out"
```

---

## Task 6: Programme Effect principal (orchestration + rapport)

**Files:**
- Create: `api/src/scripts/exportOptoutVolontaires.effect.ts`

**Interfaces:**
- Consumes: tout ce qui précède (fields, helpers, workbook, queries) ; `initDB`/`closeDB` (`../mongo`), `logger` (`../logger`), `Effect` (`effect`), `XLSX` (`xlsx`).
- Produces: exécutable via `tsx` ; exporte `{ main }` pour test éventuel.

Orchestration en 2 phases (mémoire bornée) :
- **Phase A** (onglets rattachés young) : pour chaque paquet d'emails → `findYoungsByEmails` → écrire lignes Young ; `findApplicationsByYoungIds` + `findEquivalencesByYoungIds` → écrire lignes Application/MissionEquivalence ; accumuler les maps `ref → Set(email)` (`missionId`, `classeId`, `etablissementId`).
- **Phase B** (onglets référentiels dédupliqués) : `findMissionsByIds`/`findClassesByIds`/`findEtablissementsByIds` → écrire lignes avec `youngEmail = [...emails].join("; ")` ; collecter `apiEngagementId` des missions → `findMissionAPIByIds` → onglet MissionAPI.
- **Rapport** final : compteurs par onglet + nb emails non trouvés.

- [ ] **Step 1: Write the main program**

```ts
// api/src/scripts/exportOptoutVolontaires.effect.ts
/**
 * Export (lecture seule) des volontaires opt-out 2024-2025 et de leurs modèles liés,
 * un onglet Excel par modèle + représentants légaux (email + prénom) sur l'onglet Young.
 *
 * Lecture seule : n'écrit qu'un fichier Excel local. Ne JAMAIS modifier Mongo.
 * ⚠ PII en clair dans le .xlsx de sortie : fichier créé en 0600, à transférer par
 *   canal chiffré et à SUPPRIMER après usage.
 *
 * Usage (depuis api/) :
 *   EMAILS_FILE=./Optout-2024-2025-Volontaires.xlsx OUT_FILE=./export-optout.xlsx \
 *     npx tsx src/scripts/exportOptoutVolontaires.effect.ts
 *   LIMIT=100 DRY_RUN=true EMAILS_FILE=... npx tsx src/scripts/exportOptoutVolontaires.effect.ts
 */
import fs from "fs";
import path from "path";

import * as XLSX from "xlsx";
import { Effect } from "effect";

import { initDB, closeDB } from "../mongo";
import { logger } from "../logger";
import { EXPORT_MODELS } from "./exportOptoutVolontaires.fields";
import { normalizeEmail, youngColumns, modelColumns, buildRow } from "./exportOptoutVolontaires.helpers";
import { createExportWorkbook } from "./exportOptoutVolontaires.workbook";
import {
  findYoungsByEmails, findApplicationsByYoungIds, findEquivalencesByYoungIds,
  findMissionsByIds, findEtablissementsByIds, findClassesByIds, findMissionAPIByIds,
} from "./exportOptoutVolontaires.queries";

const EMAILS_FILE = process.env.EMAILS_FILE || "./Optout-2024-2025-Volontaires.xlsx";
const OUT_FILE = process.env.OUT_FILE || "./export-optout-volontaires.xlsx";
const CHUNK = Number(process.env.CHUNK || 1000);
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : undefined;
const DRY_RUN = process.env.DRY_RUN === "true";

// Nom d'onglet par modèle (libellés lisibles).
const SHEET: Record<(typeof EXPORT_MODELS)[number], string> = {
  young: "Young", application: "Application", missionEquivalence: "MissionEquivalence",
  mission: "Mission", etablissement: "Etablissement", classe: "Classe", missionAPI: "MissionAPI",
};

function readEmails(file: string): string[] {
  const wb = XLSX.readFile(path.resolve(file));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  const emails = [...new Set(rows.map((r) => normalizeEmail(r.EMAIL)).filter(Boolean))];
  return LIMIT ? emails.slice(0, LIMIT) : emails;
}

const addTo = (map: Map<string, Set<string>>, key: unknown, email: string) => {
  if (!key) return;
  const k = String(key);
  (map.get(k) ?? map.set(k, new Set()).get(k)!).add(email);
};

async function run(): Promise<void> {
  const emails = readEmails(EMAILS_FILE);
  logger.info(`Emails à traiter: ${emails.length} (fichier ${EMAILS_FILE}${LIMIT ? `, LIMIT=${LIMIT}` : ""})`);

  const counts: Record<string, number> = { Young: 0, Application: 0, MissionEquivalence: 0, Mission: 0, Etablissement: 0, Classe: 0, MissionAPI: 0 };
  const foundEmails = new Set<string>();
  const missionEmails = new Map<string, Set<string>>();
  const classeEmails = new Map<string, Set<string>>();
  const etabEmails = new Map<string, Set<string>>();

  const wb = createExportWorkbook(OUT_FILE);
  wb.openSheet(SHEET.young, youngColumns());
  wb.openSheet(SHEET.application, modelColumns("application"));
  wb.openSheet(SHEET.missionEquivalence, modelColumns("missionEquivalence"));
  wb.openSheet(SHEET.mission, modelColumns("mission"));
  wb.openSheet(SHEET.etablissement, modelColumns("etablissement"));
  wb.openSheet(SHEET.classe, modelColumns("classe"));
  wb.openSheet(SHEET.missionAPI, modelColumns("missionAPI"));

  // --- Phase A : onglets rattachés au young, par paquets d'emails ---
  for (let i = 0; i < emails.length; i += CHUNK) {
    const part = emails.slice(i, i + CHUNK);
    const youngs = await findYoungsByEmails(part, CHUNK);
    const emailById = new Map<string, string>();
    for (const y of youngs) {
      const email = normalizeEmail(y.email);
      foundEmails.add(email);
      emailById.set(String(y._id), email);
      wb.writeRow(SHEET.young, buildRow(y, youngColumns()));
      counts.Young++;
      addTo(classeEmails, y.classeId, email);
      addTo(etabEmails, y.etablissementId, email);
    }
    const youngIds = youngs.map((y) => String(y._id));

    for (const a of await findApplicationsByYoungIds(youngIds, CHUNK)) {
      const email = normalizeEmail(a.youngEmail) || emailById.get(String(a.youngId)) || "";
      wb.writeRow(SHEET.application, buildRow({ ...a, youngEmail: email }, modelColumns("application")));
      counts.Application++;
      addTo(missionEmails, a.missionId, email);
    }
    for (const e of await findEquivalencesByYoungIds(youngIds, CHUNK)) {
      const email = emailById.get(String(e.youngId)) || "";
      wb.writeRow(SHEET.missionEquivalence, buildRow({ ...e, youngEmail: email }, modelColumns("missionEquivalence")));
      counts.MissionEquivalence++;
    }
    logger.info(`Phase A: ${Math.min(i + CHUNK, emails.length)}/${emails.length} emails traités`);
  }

  // --- Phase B : onglets référentiels dédupliqués ---
  const apiEmails = new Map<string, Set<string>>();
  for (const m of await findMissionsByIds([...missionEmails.keys()], CHUNK)) {
    const emailsForMission = [...(missionEmails.get(String(m._id)) ?? new Set())];
    wb.writeRow(SHEET.mission, buildRow({ ...m, youngEmail: emailsForMission.join("; ") }, modelColumns("mission")));
    counts.Mission++;
    if (m.apiEngagementId) for (const em of emailsForMission) addTo(apiEmails, m.apiEngagementId, em);
  }
  for (const c of await findClassesByIds([...classeEmails.keys()], CHUNK)) {
    wb.writeRow(SHEET.classe, buildRow({ ...c, youngEmail: [...(classeEmails.get(String(c._id)) ?? [])].join("; ") }, modelColumns("classe")));
    counts.Classe++;
  }
  for (const et of await findEtablissementsByIds([...etabEmails.keys()], CHUNK)) {
    wb.writeRow(SHEET.etablissement, buildRow({ ...et, youngEmail: [...(etabEmails.get(String(et._id)) ?? [])].join("; ") }, modelColumns("etablissement")));
    counts.Etablissement++;
  }
  for (const ma of await findMissionAPIByIds([...apiEmails.keys()], CHUNK)) {
    wb.writeRow(SHEET.missionAPI, buildRow({ ...ma, youngEmail: [...(apiEmails.get(String(ma._id)) ?? [])].join("; ") }, modelColumns("missionAPI")));
    counts.MissionAPI++;
  }

  for (const model of EXPORT_MODELS) await wb.commitSheet(SHEET[model]);
  await wb.commit();
  try { fs.chmodSync(path.resolve(OUT_FILE), 0o600); } catch { /* best-effort */ }

  const notFound = emails.filter((e) => !foundEmails.has(e));
  logger.info(`Export terminé -> ${OUT_FILE}`);
  logger.info(`Lignes par onglet: ${JSON.stringify(counts)}`);
  logger.info(`Emails non trouvés: ${notFound.length}/${emails.length}`);
  if (notFound.length) {
    const nfFile = OUT_FILE.replace(/\.xlsx$/, "") + ".emails-non-trouves.txt";
    fs.writeFileSync(path.resolve(nfFile), notFound.join("\n"), { mode: 0o600 });
    logger.info(`Liste des non trouvés: ${nfFile}`);
  }
}

const main = Effect.acquireUseRelease(
  Effect.tryPromise(() => initDB()),
  () => (DRY_RUN
    ? Effect.tryPromise(async () => {
        const emails = readEmails(EMAILS_FILE);
        const sample = emails.slice(0, Math.min(CHUNK, emails.length));
        const youngs = await findYoungsByEmails(sample, CHUNK);
        logger.info(`[DRY_RUN] ${emails.length} emails ; échantillon ${sample.length} -> ${youngs.length} youngs matchés. Aucun fichier écrit.`);
      })
    : Effect.tryPromise(() => run())),
  () => Effect.tryPromise(() => closeDB()).pipe(Effect.ignore),
);

if (require.main === module) {
  Effect.runPromise(main)
    .then(() => process.exit(0))
    .catch((e) => { logger.error(e); process.exit(1); });
}

export { main, run, readEmails };
```

- [ ] **Step 2: Typecheck the new files**

Run: `cd api && npx tsc --noEmit -p tsconfig.json 2>&1 | grep exportOptoutVolontaires || echo "OK: pas d'erreur TS sur les fichiers export"`
Expected: `OK: pas d'erreur TS...` (corriger toute erreur signalée avant de continuer)

- [ ] **Step 3: DRY_RUN de fumée sur un petit échantillon (prod lecture seule)**

Run:
```bash
cd api && LIMIT=50 DRY_RUN=true EMAILS_FILE="/Users/pam/Downloads/Optout-2024-2025-Volontaires.xlsx" \
  npx tsx src/scripts/exportOptoutVolontaires.effect.ts
```
Expected: log `[DRY_RUN] 50 emails ; échantillon 50 -> N youngs matchés. Aucun fichier écrit.` (N ≥ 0, aucune écriture Mongo, aucun .xlsx créé).

- [ ] **Step 4: Run réel sur un petit échantillon et vérifier le fichier**

Run:
```bash
cd api && LIMIT=200 EMAILS_FILE="/Users/pam/Downloads/Optout-2024-2025-Volontaires.xlsx" \
  OUT_FILE=./export-optout-sample.xlsx npx tsx src/scripts/exportOptoutVolontaires.effect.ts
```
Vérifier : les 7 onglets existent, l'onglet Young a les colonnes `parent1Email…parent2FirstName`, chaque onglet lié a `youngEmail`. (Ouvrir avec un tableur, ou relire via un court `XLSX.readFile` → `SheetNames`.)
Expected: fichier `export-optout-sample.xlsx` créé en 0600, compteurs cohérents dans les logs.

- [ ] **Step 5: Commit**

```bash
git add api/src/scripts/exportOptoutVolontaires.effect.ts
git commit -m "feat(api): programme export volontaires opt-out (effect, streaming, lecture seule)"
```

- [ ] **Step 6: Run complet (opérateur, hors CI)**

Après validation de l'échantillon, run complet (48 854 emails). Prévoir la durée (I/O réseau Mongo). Vérifier le rapport final (compteurs + non-trouvés), transférer le .xlsx par canal chiffré, puis **supprimer** les fichiers PII locaux (`export-optout*.xlsx`, `*.emails-non-trouves.txt`).

---

## Self-Review (fait à l'écriture du plan)

- **Couverture spec** : source prod lecture seule (Task 5/6) ✓ ; 7 onglets + exclusions (Task 1) ✓ ; représentants légaux (Task 3/6) ✓ ; jointures young/application/equivalence + références mission/classe/étab/API (Task 6) ✓ ; format 1 onglet/modèle streaming anti-OOM (Task 4/6) ✓ ; match par email toutes cohortes (Task 6 `readEmails`/`findYoungsByEmails`) ✓ ; rapport + non-trouvés (Task 6) ✓.
- **Placeholders** : aucun « TODO/TBD » de code ; la seule inconnue (clé de jointure MissionAPI) est un **step de vérification exécutable** (Task 5 Step 1) avec valeur par défaut et repli documenté.
- **Cohérence des types** : `buildRow(doc, columns)`, `modelColumns(model)`, `createExportWorkbook(...).writeRow/commitSheet/commit`, signatures `find…(ids, chunkSize)` — noms identiques entre Tasks 2/3/4/5/6.
- **Risques connus** : `mission.jvaRawData` volumineux → plafonné par `toCell` (Task 2) ; install de dép évitée (Task 1) ; worktree en retard → prérequis « brancher depuis main ».

## Points de vigilance restants

1. Jointure MissionAPI à confirmer (Task 5 Step 1).
2. Volumétrie onglet Application (un young peut avoir plusieurs candidatures) — attendu, non borné.
3. Doublons d'email côté young (ré-inscriptions) : l'onglet Young peut dépasser 48 854 lignes — voulu.
4. PII en clair dans la sortie : 0600 + suppression après transfert.
