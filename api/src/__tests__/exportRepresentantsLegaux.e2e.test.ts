import fs from "fs";
import { tmpdir } from "os";
import { join } from "path";
import * as XLSX from "xlsx";

import { dbConnect, dbClose } from "./helpers/db";
import { YoungModel } from "../models";
import getNewYoungFixture from "./fixtures/young";

// Stub Brevo (cf. note dans exportOptoutVolontaires.e2e.test.ts) : le api/.env local force
// ENVIRONMENT=production, ce qui défait le garde "skip si test" du hook post("save") du Young.
jest.mock("../brevo", () => ({ ...jest.requireActual("../brevo"), sync: jest.fn(), unsync: jest.fn() }));

// L'effect lit EMAILS_FILE/OUT_FILE en consts de module : on le `require()` (pas `import`)
// DANS le test, après avoir posé les env, et SANS jest.isolateModules (qui déconnecterait mongoose).

let yId: any;
let emailsPath = "";
let outPath = "";

beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
});
afterAll(async () => {
  try { if (yId) await YoungModel.deleteOne({ _id: yId }); } catch { /* best-effort */ }
  for (const p of [emailsPath, outPath]) {
    try { if (p) fs.unlinkSync(p); } catch { /* best-effort */ }
  }
  await dbClose();
});

it("produit un fichier 2 colonnes (email, prénom), 1 ligne/email, prénom vide si introuvable", async () => {
  const y = await YoungModel.create({
    ...getNewYoungFixture(),
    email: "rl2-jeune@test.fr",
    parent1Email: "p1rl@test.fr",
    parent1FirstName: "Alice",
  });
  yId = y._id;

  emailsPath = join(tmpdir(), `rl-emails-${process.pid}.xlsx`);
  const ws = XLSX.utils.aoa_to_sheet([["EMAIL"], ["p1rl@test.fr"], ["absent-rl@test.fr"]]);
  const wbIn = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wbIn, ws, "Sheet1");
  XLSX.writeFile(wbIn, emailsPath);

  outPath = join(tmpdir(), `rl-out-${process.pid}.xlsx`);
  process.env.EMAILS_FILE = emailsPath;
  process.env.OUT_FILE = outPath;
  delete process.env.LIMIT;
  delete process.env.DRY_RUN;

  const { run } = require("../scripts/exportRepresentantsLegaux.effect");
  await run();

  const read = XLSX.readFile(outPath);
  expect(read.SheetNames).toEqual(["RepresentantsLegaux"]);
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(read.Sheets.RepresentantsLegaux);
  expect(rows).toHaveLength(2);

  const found = rows.find((r) => r.email === "p1rl@test.fr");
  expect(found?.prenom).toBe("Alice");

  const absent = rows.find((r) => r.email === "absent-rl@test.fr");
  expect(absent).toBeDefined();
  expect(absent?.prenom ?? "").toBe(""); // prénom vide -> cellule omise par sheet_to_json
});
