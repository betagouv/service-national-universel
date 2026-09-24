/**
 * Lot L3 — imports de fichiers (audit du 21/09/2026).
 *
 *   L32 — import plan marketing : nom de fichier client comme clé S3, type MIME déclaré, pas d'antivirus
 *   L33 — import PDR : nom de fichier client comme clé S3, fichiers temporaires non purgés, `error.message` renvoyé
 *   M63, L16 — import du plan de transport : route supprimée par #5312, le service orphelin l'est ici
 *   L5  — PII sur stdout dans `update-referents-by-csv` : route supprimée (cle-routes-supprimees.test.ts)
 */
import fs from "fs";
import os from "os";
import path from "path";
import request from "supertest";
import * as XLSX from "xlsx";
import { UploadedFile } from "express-fileupload";

import { ERRORS, MIME_TYPES, PLAN_MARKETING_FOLDER_PATH_EXPORT, ROLES } from "snu-lib";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { assertImportedFile, buildImportedFileKey } from "../utils/importedFile";
import { scanFile } from "../utils/virusScanner";
import { uploadFile } from "../utils";
import { importPointDeRassemblement } from "../planDeTransport/pointDeRassemblement/import/pointDeRassemblementImportService";

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../brevo", () => ({ ...jest.requireActual("../brevo"), sendTemplate: jest.fn().mockResolvedValue(undefined) }));
jest.mock("../utils/virusScanner", () => ({ scanFile: jest.fn().mockResolvedValue({ infected: false }) }));
jest.mock("../utils", () => ({ ...jest.requireActual("../utils"), uploadFile: jest.fn().mockResolvedValue({}) }));
jest.mock("../planDeTransport/pointDeRassemblement/import/pointDeRassemblementImportService", () => ({
  ...jest.requireActual("../planDeTransport/pointDeRassemblement/import/pointDeRassemblementImportService"),
  importPointDeRassemblement: jest.fn(),
}));

jest.setTimeout(60000);

// Chemin accepté par apiv2 pour créer une liste de diffusion (PlanMarketing.controller.ts).
const PLAN_MARKETING_PATH_FILE_REGEX = new RegExp(`^${PLAN_MARKETING_FOLDER_PATH_EXPORT}/[A-Za-z0-9_-]+\\.csv$`);
const SUPER_ADMIN = { role: ROLES.ADMIN, subRole: "god" };

const CSV = Buffer.from("email;prenom\njeanne@example.com;Jeanne\n");
const PNG = Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8ffff3f0005fe02fea7d6a4a20000000049454e44ae426082", "hex");
const XLSX_BUFFER: Buffer = (() => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Matricule du point de rassemblement"], ["PDR-1"]]), "PDR");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
})();

let tmpDir: string;
beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lot-l3-"));
});
afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
afterEach(() => {
  resetAppAuth();
  jest.clearAllMocks();
});

function uploadedFile(content: Buffer, name = "fichier"): UploadedFile {
  const tempFilePath = path.join(tmpDir, `${Date.now()}-${Math.random()}`);
  fs.writeFileSync(tempFilePath, content);
  return { name, tempFilePath } as UploadedFile;
}

/** Fichiers temporaires d'express-fileupload présents dans /tmp (`tmp-<n>-<timestamp>`). */
function fileUploadTempFiles(): string[] {
  return fs.readdirSync("/tmp").filter((name) => /^tmp-\d+-\d+$/.test(name));
}

async function waitForTempFilesPurge(before: string[]) {
  for (let i = 0; i < 20; i++) {
    if (fileUploadTempFiles().every((name) => before.includes(name))) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

describe("buildImportedFileKey", () => {
  it("n'utilise jamais le nom du fichier client et respecte le chemin accepté par apiv2", () => {
    const key = buildImportedFileKey(PLAN_MARKETING_FOLDER_PATH_EXPORT, "csv");
    expect(key).toMatch(PLAN_MARKETING_PATH_FILE_REGEX);
    expect(buildImportedFileKey("file/point-de-rassemblement", "xlsx")).toMatch(/^file\/point-de-rassemblement\/[A-Za-z0-9_-]+\.xlsx$/);
  });

  it("produit une clé différente à chaque appel, même à la même milliseconde", () => {
    const date = new Date();
    expect(buildImportedFileKey("dossier", "csv", date)).not.toBe(buildImportedFileKey("dossier", "csv", date));
  });
});

describe("assertImportedFile", () => {
  it("accepte un CSV texte et un vrai classeur XLSX", async () => {
    await expect(assertImportedFile(uploadedFile(CSV), "csv")).resolves.toBeUndefined();
    await expect(assertImportedFile(uploadedFile(XLSX_BUFFER), "xlsx")).resolves.toBeUndefined();
  });

  it("refuse un contenu qui ne correspond pas au type attendu, quel que soit le MIME déclaré", async () => {
    await expect(assertImportedFile(uploadedFile(PNG), "csv")).rejects.toThrow(ERRORS.UNSUPPORTED_TYPE);
    await expect(assertImportedFile(uploadedFile(XLSX_BUFFER), "csv")).rejects.toThrow(ERRORS.UNSUPPORTED_TYPE);
    await expect(assertImportedFile(uploadedFile(CSV), "xlsx")).rejects.toThrow(ERRORS.UNSUPPORTED_TYPE);
    await expect(assertImportedFile(uploadedFile(Buffer.from("a;b\n\u0000\u0001")), "csv")).rejects.toThrow(ERRORS.UNSUPPORTED_TYPE);
  });

  it("refuse un fichier signalé par l'antivirus", async () => {
    (scanFile as jest.Mock).mockResolvedValueOnce({ infected: true });
    await expect(assertImportedFile(uploadedFile(CSV), "csv")).rejects.toThrow(ERRORS.FILE_INFECTED);
  });
});

describe("L32 — POST /plan-marketing/import", () => {
  it("range le fichier sous une clé générée côté serveur et la renvoie", async () => {
    const before = fileUploadTempFiles();
    const res = await request(getAppHelper(SUPER_ADMIN)).post("/plan-marketing/import").attach("file", CSV, { filename: "../../file/young/x.csv", contentType: MIME_TYPES.CSV });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatch(PLAN_MARKETING_PATH_FILE_REGEX);
    expect(res.body.data).not.toContain("..");
    expect(uploadFile).toHaveBeenCalledTimes(1);
    expect((uploadFile as jest.Mock).mock.calls[0][0]).toBe(res.body.data);
    expect(scanFile).toHaveBeenCalledTimes(1);

    await waitForTempFilesPurge(before);
    expect(fileUploadTempFiles().filter((name) => !before.includes(name))).toEqual([]);
  });

  it("refuse un binaire déclaré en text/csv sans rien téléverser", async () => {
    const res = await request(getAppHelper(SUPER_ADMIN)).post("/plan-marketing/import").attach("file", PNG, { filename: "contacts.csv", contentType: MIME_TYPES.CSV });

    expect(res.status).toBe(422);
    expect(res.body).toEqual({ ok: false, code: ERRORS.UNSUPPORTED_TYPE });
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("reste réservé au super-admin", async () => {
    const res = await request(getAppHelper({ role: ROLES.ADMIN, subRole: "NONgod" }))
      .post("/plan-marketing/import")
      .attach("file", CSV, { filename: "contacts.csv", contentType: MIME_TYPES.CSV });

    expect(res.status).toBe(403);
    expect(uploadFile).not.toHaveBeenCalled();
  });
});

describe("L33 — POST /point-de-rassemblement/import", () => {
  it("range le fichier sous une clé générée côté serveur", async () => {
    (importPointDeRassemblement as jest.Mock).mockResolvedValueOnce([{ matricule: "PDR-1", action: "created" }]);
    const before = fileUploadTempFiles();
    const res = await request(getAppHelper(SUPER_ADMIN))
      .post("/point-de-rassemblement/import")
      .attach("file", XLSX_BUFFER, { filename: "../x.xlsx", contentType: MIME_TYPES.EXCEL });

    expect(res.status).toBe(200);
    const keys = (uploadFile as jest.Mock).mock.calls.map(([key]) => key);
    expect(keys[0]).toMatch(/^file\/point-de-rassemblement\/[A-Za-z0-9_-]+\.xlsx$/);
    expect(keys.join(" ")).not.toContain("..");

    await waitForTempFilesPurge(before);
    expect(fileUploadTempFiles().filter((name) => !before.includes(name))).toEqual([]);
  });

  it("ne renvoie pas le message d'une erreur technique", async () => {
    (importPointDeRassemblement as jest.Mock).mockRejectedValueOnce(new Error("E11000 duplicate key error collection: snu.pointderassemblements"));
    const res = await request(getAppHelper(SUPER_ADMIN))
      .post("/point-de-rassemblement/import")
      .attach("file", XLSX_BUFFER, { filename: "pdr.xlsx", contentType: MIME_TYPES.EXCEL });

    expect(res.status).toBe(422);
    expect(res.body).toEqual({ ok: false, code: ERRORS.FILE_CORRUPTED });
  });

  it("garde le message des colonnes manquantes, destiné à l'utilisateur", async () => {
    const { checkColumnHeaders } = jest.requireActual("../planDeTransport/pointDeRassemblement/import/pointDeRassemblementImportService");
    (importPointDeRassemblement as jest.Mock).mockImplementationOnce(async () => checkColumnHeaders(["Adresse"]));
    const res = await request(getAppHelper(SUPER_ADMIN))
      .post("/point-de-rassemblement/import")
      .attach("file", XLSX_BUFFER, { filename: "pdr.xlsx", contentType: MIME_TYPES.EXCEL });

    expect(res.status).toBe(422);
    expect(res.body.code).toBe(ERRORS.INVALID_BODY);
    expect(res.body.message).toContain("Matricule du point de rassemblement");
  });

  it("refuse un fichier qui n'est pas un classeur XLSX sans rien téléverser", async () => {
    const res = await request(getAppHelper(SUPER_ADMIN)).post("/point-de-rassemblement/import").attach("file", CSV, { filename: "pdr.xlsx", contentType: MIME_TYPES.EXCEL });

    expect(res.status).toBe(422);
    expect(res.body).toEqual({ ok: false, code: ERRORS.UNSUPPORTED_TYPE });
    expect(uploadFile).not.toHaveBeenCalled();
    expect(importPointDeRassemblement).not.toHaveBeenCalled();
  });
});

describe("M63, L16 — import du plan de transport", () => {
  it("le service d'import orphelin est supprimé", () => {
    expect(fs.existsSync(path.join(__dirname, "../planDeTransport/planDeTransport/import/pdtImportService.ts"))).toBe(false);
  });

  it("aucune route d'import de plan de transport n'est montée", async () => {
    const res = await request(getAppHelper(SUPER_ADMIN)).post("/plan-de-transport/import").attach("file", XLSX_BUFFER, { filename: "pdt.xlsx", contentType: MIME_TYPES.EXCEL });
    expect(res.status).toBe(404);
  });
});
