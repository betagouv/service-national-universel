/**
 * Lot P29 (suite) — routes de dépôt montées sans `tempFileUpload()` : `POST /SNUpport/upload` et
 * `POST /plan-marketing/import`, et `abandonableFileUpload` qu'elles utilisent. Quand la connexion se ferme avant la fin
 * de l'analyse, aucun fichier temporaire ne doit rester et la requête ne doit pas être transmise au gestionnaire. Un
 * envoi complet reste traité comme avant.
 */
import { once } from "events";
import fs from "fs";
import http from "http";
import { AddressInfo } from "net";
import os from "os";
import pathModule from "path";
import express from "express";
import { Types } from "mongoose";
import { MIME_TYPES, ROLES } from "snu-lib";

import { abandonableFileUpload } from "../middlewares/tempUpload";
import getAppHelper, { resetAppAuth } from "./helpers/app";
import { consumeUploadQuota } from "../services/supportAttachments";
import { uploadFile } from "../utils";
import { getMimeFromFile } from "../utils/file";
import { assertImportedFile } from "../utils/importedFile";

jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../utils", () => ({ ...jest.requireActual("../utils"), uploadFile: jest.fn().mockResolvedValue({ Location: "https://bucket.example/x", key: "x" }) }));
jest.mock("../utils/virusScanner", () => ({ scanFile: jest.fn().mockResolvedValue({ infected: false }) }));
jest.mock("../utils/file", () => ({ ...jest.requireActual("../utils/file"), getMimeFromFile: jest.fn() }));
jest.mock("../cryptoUtils", () => ({ ...jest.requireActual("../cryptoUtils"), encrypt: (buffer: Buffer) => buffer }));
jest.mock("../services/supportAttachments", () => ({
  ...jest.requireActual("../services/supportAttachments"),
  consumeUploadQuota: jest.fn().mockResolvedValue(true),
  rememberAttachment: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../utils/importedFile", () => {
  const actual = jest.requireActual("../utils/importedFile");
  return { ...actual, assertImportedFile: jest.fn(actual.assertImportedFile) };
});

jest.setTimeout(60000);

const BOUNDARY = "lot-p29-coupure";

function filePart(name: string, filename: string, contentType: string, content?: Buffer) {
  const header = Buffer.from(`--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`);
  return content ? Buffer.concat([header, content, Buffer.from("\r\n")]) : header;
}

async function waitUntil(condition: () => boolean, attempts = 200) {
  for (let i = 0; i < attempts && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 25));
}

type AppUser = Parameters<typeof getAppHelper>[0];

const routes: { name: string; path: string; limit: number; user: AppUser; detectedMime: string | null; smallFile: () => Buffer; handlerCalled: () => boolean }[] = [
  {
    name: "POST /SNUpport/upload",
    path: "/SNUpport/upload",
    limit: 10 * 1024 * 1024,
    user: { _id: new Types.ObjectId().toString(), role: ROLES.REFERENT_DEPARTMENT },
    detectedMime: "application/pdf",
    smallFile: () => filePart("petit", "petit.pdf", "application/pdf", Buffer.from("%PDF-1.4\n%lot P29\n")),
    handlerCalled: () => (consumeUploadQuota as jest.Mock).mock.calls.length > 0,
  },
  {
    name: "POST /plan-marketing/import",
    path: "/plan-marketing/import",
    limit: 8 * 1024 * 1024,
    user: { role: ROLES.ADMIN, subRole: "god" },
    // Un CSV n'a pas de signature : la détection par le contenu ne renvoie rien.
    detectedMime: null,
    smallFile: () => filePart("petit", "petit.csv", MIME_TYPES.CSV, Buffer.from("email;prenom\njeanne@example.com;Jeanne\n")),
    handlerCalled: () => (assertImportedFile as jest.Mock).mock.calls.length > 0,
  },
];

const cases = routes.flatMap((route) => [
  { ...route, label: "seul", withSmallFile: false },
  { ...route, label: "précédé d'un petit fichier complet", withSmallFile: true },
]);

describe("routes de dépôt sans tempFileUpload", () => {
  let server: http.Server;
  let tempFiles: string[];
  let createWriteStream: jest.SpyInstance;

  beforeEach(() => {
    // Chemins exacts des fichiers temporaires ouverts par express-fileupload pendant le test : /tmp est partagé.
    tempFiles = [];
    const original = fs.createWriteStream;
    createWriteStream = jest.spyOn(fs, "createWriteStream").mockImplementation((...args: Parameters<typeof fs.createWriteStream>) => {
      const [filePath] = args;
      if (typeof filePath === "string" && /^\/tmp\/tmp-\d+-\d+$/.test(filePath)) tempFiles.push(filePath);
      return original(...args);
    });
  });

  afterEach(async () => {
    createWriteStream.mockRestore();
    server?.closeAllConnections();
    await new Promise((resolve) => server?.close(resolve));
    resetAppAuth();
    jest.clearAllMocks();
  });

  async function listen(app: express.Express) {
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    return (server.address() as AddressInfo).port;
  }

  function post(port: number, path: string, agent: http.Agent) {
    return http.request({ host: "127.0.0.1", port, method: "POST", path, agent, headers: { "content-type": `multipart/form-data; boundary=${BOUNDARY}` } });
  }

  it.each(routes)("$name : un envoi complet sous la limite est traité et ses fichiers sont purgés", async ({ path, user, detectedMime, smallFile, handlerCalled }) => {
    (getMimeFromFile as jest.Mock).mockResolvedValue(detectedMime);
    const port = await listen(getAppHelper(user));
    const agent = new http.Agent({ keepAlive: true });
    try {
      const req = post(port, path, agent);
      req.end(Buffer.concat([smallFile(), Buffer.from(`--${BOUNDARY}--\r\n`)]));
      const [res] = (await once(req, "response")) as [http.IncomingMessage];
      res.resume();
      await once(res, "end");
      expect(res.statusCode).toBe(200);
    } finally {
      agent.destroy();
    }
    expect(handlerCalled()).toBe(true);
    expect(uploadFile).toHaveBeenCalledTimes(1);
    expect(tempFiles).toHaveLength(1);
    await waitUntil(() => tempFiles.every((file) => !fs.existsSync(file)));
    expect(tempFiles.filter((file) => fs.existsSync(file))).toEqual([]);
  });

  // Le petit fichier est terminé (le délimiteur suivant est arrivé) mais pas les en-têtes de la partie suivante : aucun
  // fichier n'est en cours, donc ni limite ni délai d'envoi.
  it.each(routes)("$name : coupure entre deux parties, fichier déjà reçu purgé et requête non traitée", async ({ path, user, smallFile, handlerCalled }) => {
    const port = await listen(getAppHelper(user));
    const agent = new http.Agent({ keepAlive: true });
    const req = post(port, path, agent);
    req.on("error", () => {});
    req.write(Buffer.concat([smallFile(), Buffer.from(`--${BOUNDARY}\r\nContent-Disposition: form-data; name="suite"`)]));

    const received = () => tempFiles.length === 1 && fs.existsSync(tempFiles[0]) && fs.statSync(tempFiles[0]).size > 0;
    await waitUntil(received);
    expect(received()).toBe(true);

    req.destroy();
    agent.destroy();

    await waitUntil(() => tempFiles.every((file) => !fs.existsSync(file)));
    expect(tempFiles.filter((file) => fs.existsSync(file))).toEqual([]);
    expect(handlerCalled()).toBe(false);
  });

  // Le corps s'arrête en plein fichier trop gros : sa partie ne se termine jamais, et le délai d'envoi d'express-fileupload
  // s'arrête au dépassement. Seule la fermeture de la connexion peut purger le fichier tronqué.
  it.each(cases)("$name : fichier trop gros $label, purgé à la coupure et requête non traitée", async ({ path, limit, user, smallFile, withSmallFile, handlerCalled }) => {
    const port = await listen(getAppHelper(user));
    const agent = new http.Agent({ keepAlive: true });
    const req = post(port, path, agent);
    req.on("error", () => {});
    const parts = [...(withSmallFile ? [smallFile()] : []), filePart("gros", "gros.bin", "application/octet-stream"), Buffer.alloc(2 * limit, "a")];
    req.write(Buffer.concat(parts));

    // Le serveur a dépassé la limite : le fichier tronqué est écrit en entier.
    const truncated = () => tempFiles.some((file) => fs.existsSync(file) && fs.statSync(file).size >= limit);
    await waitUntil(truncated);
    expect(truncated()).toBe(true);
    expect(tempFiles).toHaveLength(withSmallFile ? 2 : 1);

    req.destroy();
    agent.destroy();

    await waitUntil(() => tempFiles.every((file) => !fs.existsSync(file)));
    expect(tempFiles.filter((file) => fs.existsSync(file))).toEqual([]);
    expect(handlerCalled()).toBe(false);
  });
});

// Coupure en plein fichier sous la limite : le délai d'envoi d'express-fileupload abandonne ce fichier et passe la main.
describe("abandonableFileUpload : coupure en plein fichier sous la limite (délai d'envoi court)", () => {
  const LIMIT = 1024 * 1024;
  let uploadDir: string;
  let server: http.Server;
  let handlerCalls: number;

  beforeEach(async () => {
    uploadDir = fs.mkdtempSync(pathModule.join(os.tmpdir(), "lot-p29-coupure-"));
    handlerCalls = 0;
    const app = express();
    app.post("/upload", abandonableFileUpload({ limits: { fileSize: LIMIT }, useTempFiles: true, tempFileDir: uploadDir, uploadTimeout: 300 }), (_req, res) => {
      handlerCalls++;
      res.send({ ok: true });
    });
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
  });

  afterEach(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(uploadDir, { recursive: true, force: true });
  });

  it("purge le fichier inachevé et n'appelle pas le gestionnaire", async () => {
    const agent = new http.Agent({ keepAlive: true });
    const req = http.request({
      host: "127.0.0.1",
      port: (server.address() as AddressInfo).port,
      method: "POST",
      path: "/upload",
      agent,
      headers: { "content-type": `multipart/form-data; boundary=${BOUNDARY}` },
    });
    req.on("error", () => {});
    req.write(Buffer.concat([filePart("moyen", "moyen.bin", "application/octet-stream"), Buffer.alloc(LIMIT / 2, "a")]));

    const written = () => fs.readdirSync(uploadDir).some((name) => fs.statSync(pathModule.join(uploadDir, name)).size >= LIMIT / 2);
    await waitUntil(written);
    expect(written()).toBe(true);

    req.destroy();
    agent.destroy();

    // Le délai d'envoi supprime le fichier puis passe la main dans la foulée.
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(fs.readdirSync(uploadDir)).toEqual([]);
    expect(handlerCalls).toBe(0);
  });
});
