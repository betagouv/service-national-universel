import fs from "fs";
import { tmpdir } from "os";
import { join } from "path";
import * as XLSX from "xlsx";

import { dbConnect, dbClose } from "./helpers/db";
import { YoungModel, ApplicationModel, MissionModel } from "../models";
import getNewYoungFixture from "./fixtures/young";
import { getNewApplicationFixture } from "./fixtures/application";
import getNewMissionFixture from "./fixtures/mission";

// The Young model's post("save")/post("deleteOne") hooks normally skip Brevo sync when
// config.ENVIRONMENT === "test" (see src/models/young.ts) -- but this checkout's local api/.env
// hardcodes ENVIRONMENT=production, which defeats that guard for ANY local jest run seeding a
// Young. Stubbing just sync/unsync here (scoped to this test file only, same pattern already
// used in young.test.ts / application.test.ts / young-auth.test.ts) keeps this e2e test genuinely
// offline/deterministic regardless of that local env quirk, without touching the shared .env or
// the young.ts model.
jest.mock("../brevo", () => ({
  ...jest.requireActual("../brevo"),
  sync: jest.fn(),
  unsync: jest.fn(),
}));

// NOTE: `exportOptoutVolontaires.effect.ts` reads EMAILS_FILE/OUT_FILE/CHUNK/LIMIT/DRY_RUN as
// module-level consts, captured once when the module is first evaluated. To exercise it with
// test-specific env values, this file NEVER imports it at the top; it is `require()`d exactly
// once, inside the test, right after the env vars are set (a plain `require()` is not hoisted by
// the TS/CommonJS compiler the way `import` is, so it evaluates in place, in source order).
//
// This deliberately avoids `jest.isolateModules`: verified empirically that it creates a fresh,
// disconnected `mongoose` module instance for the whole dependency chain (../models -> mongoose),
// which would make `run()`'s queries hang against a never-connected connection. A plain first-time
// `require()` reuses this file's single, already-connected module registry instead.

const EXPECTED_SHEETS = ["Young", "Application", "MissionEquivalence", "Mission", "Etablissement", "Classe", "MissionAPI"];

describe("exportOptoutVolontaires e2e (offline, local test mongo)", () => {
  let missionId: any;
  let y1Id: any;
  let y2Id: any;
  let appId: any;
  let emailsPath: string | undefined;
  let outPath: string | undefined;
  let nfPath: string | undefined;

  beforeAll(async () => {
    await dbConnect(__filename.slice(__dirname.length + 1, -3));
    // Dédié à ce fichier de test (nom de DB dérivé du nom de fichier), mais on nettoie quand même
    // les documents marqueurs de ce test avant de semer : robuste à un run précédent interrompu
    // avant son propre nettoyage. Ciblé (pas clearDatabase()) : avec les ~39 modèles enregistrés
    // process-wide via ../models, un clearDatabase() ici s'est avéré prendre plusieurs minutes.
    await YoungModel.deleteMany({ email: { $in: ["e2e-un@test.fr", "e2e-deux@test.fr"] } });
    await MissionModel.deleteMany({ name: "Mission E2E" });
    await ApplicationModel.deleteMany({ youngEmail: "e2e-un@test.fr" });
  });

  afterAll(async () => {
    try { if (appId) await ApplicationModel.deleteOne({ _id: appId }); } catch { /* best-effort */ }
    try { if (missionId) await MissionModel.deleteOne({ _id: missionId }); } catch { /* best-effort */ }
    try { if (y1Id) await YoungModel.deleteOne({ _id: y1Id }); } catch { /* best-effort */ }
    try { if (y2Id) await YoungModel.deleteOne({ _id: y2Id }); } catch { /* best-effort */ }
    try { if (emailsPath) fs.unlinkSync(emailsPath); } catch { /* best-effort */ }
    try { if (outPath) fs.unlinkSync(outPath); } catch { /* best-effort */ }
    try { if (nfPath) fs.unlinkSync(nfPath); } catch { /* best-effort */ }
    await dbClose();
  });

  it("exporte les jeunes opt-out matchés et leurs modèles liés, et liste les emails non trouvés", async () => {
    // --- 1. Seed ---
    const mission = await MissionModel.create({ ...getNewMissionFixture(), name: "Mission E2E", isJvaMission: "false" });
    missionId = mission._id;

    const y1 = await YoungModel.create({
      ...getNewYoungFixture(),
      email: "e2e-un@test.fr",
      firstName: "Alice",
      parent1Email: "p1@test.fr",
      parent1FirstName: "Parent Un",
    });
    y1Id = y1._id;

    const y2 = await YoungModel.create({ ...getNewYoungFixture(), email: "e2e-deux@test.fr", firstName: "Bob" });
    y2Id = y2._id;

    const app = await ApplicationModel.create({
      ...getNewApplicationFixture(),
      youngId: String(y1._id),
      youngEmail: "e2e-un@test.fr",
      missionId: String(mission._id),
      status: "WAITING_VALIDATION",
    });
    appId = app._id;

    // --- 2. Emails xlsx en entrée ---
    const ws = XLSX.utils.aoa_to_sheet([["EMAIL"], ["e2e-un@test.fr"], ["e2e-deux@test.fr"], ["absent@test.fr"]]);
    const wbIn = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wbIn, ws, "Sheet1");
    emailsPath = join(tmpdir(), `e2e-emails-${process.pid}.xlsx`);
    XLSX.writeFile(wbIn, emailsPath);

    // --- 3. Env + require frais du module (cf. note en tête de fichier) ---
    outPath = join(tmpdir(), `e2e-out-${process.pid}.xlsx`);
    process.env.EMAILS_FILE = emailsPath;
    process.env.OUT_FILE = outPath;
    process.env.CHUNK = "1000";
    delete process.env.LIMIT;
    delete process.env.DRY_RUN;

    const { run } = require("../scripts/exportOptoutVolontaires.effect");
    await run();

    // --- 4. Assertions sur le fichier produit ---
    const read = XLSX.readFile(outPath);
    expect(read.SheetNames).toEqual(EXPECTED_SHEETS);

    const youngRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(read.Sheets.Young);
    expect(youngRows).toHaveLength(2);
    expect(youngRows.map((r) => r.email)).toEqual(expect.arrayContaining(["e2e-un@test.fr", "e2e-deux@test.fr"]));
    const rowUn = youngRows.find((r) => r.email === "e2e-un@test.fr");
    expect(rowUn?.parent1Email).toBeUndefined(); // les représentants légaux ne sont pas exportés
    expect(rowUn?.parent1FirstName).toBeUndefined();

    const appRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(read.Sheets.Application);
    expect(appRows).toHaveLength(1);
    expect(appRows[0].youngEmail).toBe("e2e-un@test.fr");

    const missionRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(read.Sheets.Mission);
    expect(missionRows).toHaveLength(1);
    expect(missionRows[0].youngEmail).toBe("e2e-un@test.fr");
    expect(missionRows[0].name).toBe("Mission E2E");

    nfPath = outPath.replace(/\.xlsx$/, "") + ".emails-non-trouves.txt";
    expect(fs.existsSync(nfPath)).toBe(true);
    const nfContent = fs.readFileSync(nfPath, "utf-8");
    expect(nfContent).toContain("absent@test.fr");
    expect(nfContent).not.toContain("e2e-un@test.fr");
    expect(nfContent).not.toContain("e2e-deux@test.fr");
  }, 30000);
});

// NOTE: contrairement au describe ci-dessus, ces deux tests utilisent `jest.isolateModules`
// pour forcer une ré-évaluation fraîche du module à chaque test (les consts EMAILS_FILE/OUT_FILE/
// CHUNK sont lues une seule fois, au premier chargement du module -- il faut donc un rechargement
// par test pour que chacun voie ses propres env vars). C'est sûr ici seulement parce que les deux
// gardes testées lèvent AVANT toute requête Mongo (cf. tête de fichier : un module fraîchement
// isolé récupère un mongoose déconnecté, ce qui ferait "hang" une vraie requête -- mais on n'en
// atteint jamais une dans ces deux tests).
describe("run() garde-fous d'entrée", () => {
  it("rejette quand le fichier d'emails est vide (en-tête seul)", async () => {
    const emptyEmailsPath = join(tmpdir(), `e2e-guard-empty-emails-${process.pid}.xlsx`);
    const guardOutPath = join(tmpdir(), `e2e-guard-empty-out-${process.pid}.xlsx`);
    try {
      const ws = XLSX.utils.aoa_to_sheet([["EMAIL"]]);
      const wbIn = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wbIn, ws, "Sheet1");
      XLSX.writeFile(wbIn, emptyEmailsPath);

      process.env.EMAILS_FILE = emptyEmailsPath;
      process.env.OUT_FILE = guardOutPath;
      process.env.CHUNK = "1000";
      delete process.env.LIMIT;
      delete process.env.DRY_RUN;

      let run: any;
      jest.isolateModules(() => {
        ({ run } = require("../scripts/exportOptoutVolontaires.effect"));
      });

      await expect(run()).rejects.toThrow(/Aucun email lu/);
      expect(fs.existsSync(guardOutPath)).toBe(false);
    } finally {
      try { fs.unlinkSync(emptyEmailsPath); } catch { /* best-effort */ }
      try { if (fs.existsSync(guardOutPath)) fs.unlinkSync(guardOutPath); } catch { /* best-effort */ }
    }
  });

  it("rejette quand CHUNK n'est pas un entier positif", async () => {
    const emailsPath = join(tmpdir(), `e2e-guard-chunk-emails-${process.pid}.xlsx`);
    const guardOutPath = join(tmpdir(), `e2e-guard-chunk-out-${process.pid}.xlsx`);
    try {
      const ws = XLSX.utils.aoa_to_sheet([["EMAIL"], ["guard-chunk@test.fr"]]);
      const wbIn = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wbIn, ws, "Sheet1");
      XLSX.writeFile(wbIn, emailsPath);

      process.env.EMAILS_FILE = emailsPath;
      process.env.OUT_FILE = guardOutPath;
      process.env.CHUNK = "0";
      delete process.env.LIMIT;
      delete process.env.DRY_RUN;

      let run: any;
      jest.isolateModules(() => {
        ({ run } = require("../scripts/exportOptoutVolontaires.effect"));
      });

      await expect(run()).rejects.toThrow(/CHUNK invalide/);
      expect(fs.existsSync(guardOutPath)).toBe(false);
    } finally {
      try { fs.unlinkSync(emailsPath); } catch { /* best-effort */ }
      try { if (fs.existsSync(guardOutPath)) fs.unlinkSync(guardOutPath); } catch { /* best-effort */ }
    }
  });
});
