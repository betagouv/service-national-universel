/**
 * Lot P29 — dépôts de fichiers : plafond du nombre de fichiers par requête et purge des fichiers
 * temporaires sur tous les chemins de réponse.
 */
import express from "express";
import fs from "fs";
import os from "os";
import path from "path";
import request from "supertest";
import { UploadedFile } from "express-fileupload";

import { MAX_UPLOAD_FILES, removeTempFiles, tempFileUpload } from "../middlewares/tempUpload";
import getAppHelper, { getAppHelperWithAcl, resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../utils", () => ({ ...jest.requireActual("../utils"), uploadFile: jest.fn().mockResolvedValue({}) }));

jest.setTimeout(60000);

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const UNKNOWN_ID = "5f8d0d55b54764421b7156c1";

let workDir: string;
beforeAll(async () => {
  await dbConnect(__filename.slice(__dirname.length + 1, -3));
  workDir = fs.mkdtempSync(path.join(os.tmpdir(), "lot-p29-"));
});
afterAll(async () => {
  fs.rmSync(workDir, { recursive: true, force: true });
  await dbClose();
});
afterEach(resetAppAuth);

function uploadedFile(content = "x"): UploadedFile {
  const tempFilePath = path.join(workDir, `${Date.now()}-${Math.random()}`);
  fs.writeFileSync(tempFilePath, content);
  return { name: "fichier", tempFilePath } as UploadedFile;
}

/** Fichiers temporaires d'express-fileupload dans /tmp (`tmp-<n>-<timestamp>`). */
function fileUploadTempFiles(): string[] {
  return fs.readdirSync("/tmp").filter((name) => /^tmp-\d+-\d+$/.test(name));
}

async function waitUntil(condition: () => boolean) {
  for (let i = 0; i < 40 && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 25));
}

function attachFiles(req: request.Test, count: number, size = 1) {
  for (let i = 0; i < count; i++) req.attach(`file${i}`, Buffer.alloc(size, "a"), `piece-${i}.txt`);
  return req;
}

describe("removeTempFiles", () => {
  it("supprime tous les fichiers, qu'ils soient seuls ou en tableau", async () => {
    const [a, b, c] = [uploadedFile(), uploadedFile(), uploadedFile()];
    await removeTempFiles({ a, b: [b, c] });
    for (const file of [a, b, c]) expect(fs.existsSync(file.tempFilePath)).toBe(false);
  });

  it("accepte l'absence de fichiers et les fichiers sans chemin temporaire", async () => {
    await expect(removeTempFiles(undefined)).resolves.toBeUndefined();
    await expect(removeTempFiles({ a: { name: "a", tempFilePath: "" } as UploadedFile })).resolves.toBeUndefined();
  });

  it("n'échoue pas quand une suppression échoue et supprime les autres fichiers", async () => {
    const aDirectory = fs.mkdtempSync(path.join(workDir, "dossier-"));
    fs.writeFileSync(path.join(aDirectory, "contenu"), "x");
    const other = uploadedFile();
    await expect(removeTempFiles({ a: { name: "a", tempFilePath: aDirectory } as UploadedFile, b: other })).resolves.toBeUndefined();
    expect(fs.existsSync(other.tempFilePath)).toBe(false);
  });
});

describe("tempFileUpload", () => {
  let uploadDir: string;
  let app: express.Express;
  let handlerCalls: number;
  beforeEach(() => {
    uploadDir = fs.mkdtempSync(path.join(workDir, "upload-"));
    handlerCalls = 0;
    app = express();
    app.post("/upload", ...tempFileUpload({ tempFileDir: uploadDir }), (req, res) => {
      handlerCalls++;
      const files = Object.values(req.files || {}).flat();
      res.status(Number(req.query.status || 200)).send({ ok: true, count: files.length });
    });
  });

  it("garde le comportement nominal avec un ou deux fichiers, puis purge le dossier", async () => {
    for (const count of [1, 2]) {
      const res = await attachFiles(request(app).post("/upload"), count);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(count);
    }
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
  });

  it.each([[400], [403], [500]])("purge les fichiers quand le gestionnaire répond %i sans les supprimer", async (status) => {
    const res = await attachFiles(request(app).post("/upload").query({ status }), 2);
    expect(res.status).toBe(status);
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
  });

  it("accepte exactement le plafond de fichiers", async () => {
    const res = await attachFiles(request(app).post("/upload"), MAX_UPLOAD_FILES);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(MAX_UPLOAD_FILES);
  });

  it("refuse en 413 une requête au-dessus du plafond et ne garde aucun fichier", async () => {
    const res = await attachFiles(request(app).post("/upload"), MAX_UPLOAD_FILES + 5);
    expect(res.status).toBe(413);
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
  });

  it("refuse en 413 un fichier plus gros que la limite de taille et ne garde aucun fichier", async () => {
    const res = await attachFiles(request(app).post("/upload"), 1, MAX_FILE_SIZE + 1);
    expect(res.status).toBe(413);
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
  });
});

describe("tempFileUpload : fichier trop gros suivi d'autres fichiers", () => {
  let uploadDir: string;
  let app: express.Express;
  let handlerCalls: number;
  beforeEach(() => {
    uploadDir = fs.mkdtempSync(path.join(workDir, "upload-"));
    handlerCalls = 0;
    app = express();
    app.post("/upload", ...tempFileUpload({ tempFileDir: uploadDir }), (req, res) => {
      handlerCalls++;
      res.send({ ok: true });
    });
  });

  it("répond 413 en JSON, ne garde aucun fichier et n'appelle pas le gestionnaire", async () => {
    const req = request(app).post("/upload").attach("gros", Buffer.alloc(MAX_FILE_SIZE + 1, "a"), "gros.txt");
    for (let i = 0; i < 20; i++) req.attach(`petit${i}`, Buffer.alloc(1, "a"), `petit-${i}.txt`);
    const res = await req;
    expect(res.status).toBe(413);
    expect(res.body).toEqual({ ok: false, code: "INVALID_BODY" });
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
    expect(handlerCalls).toBe(0);
  });

  it("ne laisse pas de fichier partiel quand un fichier plus gros que la limite précède un fichier moyen", async () => {
    const req = request(app).post("/upload").attach("petit", Buffer.alloc(10, "a"), "petit.txt");
    req.attach("gros", Buffer.alloc(MAX_FILE_SIZE + 1, "a"), "gros.txt").attach("moyen", Buffer.alloc(5 * 1024 * 1024, "a"), "moyen.txt");
    const res = await req;
    expect(res.status).toBe(413);
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
    expect(handlerCalls).toBe(0);
  });
});

describe("câblage des quatre routes de dépôt", () => {
  const routes = [
    {
      name: "POST /young/file/:key (clé non prise en charge, 500)",
      status: 500,
      send: async (files: number) => {
        const young = await createYoungHelper(getNewYoungFixture());
        return attachFiles(request(await getAppHelperWithAcl(young, "young")).post("/young/file/cniFiles").field("body", "{}"), files);
      },
    },
    {
      name: "POST /young/:id/documents/:key (body absent, 500)",
      status: 500,
      send: async (files: number) => {
        const young = await createYoungHelper(getNewYoungFixture());
        return attachFiles(request(await getAppHelperWithAcl(young, "young")).post(`/young/${young._id}/documents/cniFiles`), files);
      },
    },
    {
      name: "POST /application/:id/file/:key (candidature inconnue, 404)",
      status: 404,
      send: async (files: number) => attachFiles(request(getAppHelper()).post(`/application/${UNKNOWN_ID}/file/contractAvenantFiles`).field("body", "{}"), files),
    },
    {
      name: "POST /referent/file/:key (volontaire inconnu, 404)",
      status: 404,
      send: async (files: number) =>
        attachFiles(request(getAppHelper()).post("/referent/file/cniFiles").field("body", JSON.stringify({ names: ["a.txt"], youngId: UNKNOWN_ID })), files),
    },
  ];

  it.each(routes)("$name : aucun fichier ne reste dans /tmp", async ({ send, status }) => {
    const before = fileUploadTempFiles();
    const res = await send(2);
    expect(res.status).toBe(status);
    await waitUntil(() => fileUploadTempFiles().every((name) => before.includes(name)));
    expect(fileUploadTempFiles().filter((name) => !before.includes(name))).toEqual([]);
  });

  it.each(routes)("$name : une requête au-dessus du plafond est refusée en 413", async ({ send }) => {
    const before = fileUploadTempFiles();
    const res = await send(MAX_UPLOAD_FILES + 5);
    expect(res.status).toBe(413);
    await waitUntil(() => fileUploadTempFiles().every((name) => before.includes(name)));
    expect(fileUploadTempFiles().filter((name) => !before.includes(name))).toEqual([]);
  });
});
