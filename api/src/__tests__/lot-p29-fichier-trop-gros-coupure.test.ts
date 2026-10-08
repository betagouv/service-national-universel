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
import { PassThrough } from "stream";
import express from "express";
import { Types } from "mongoose";
import { MIME_TYPES, ROLES } from "snu-lib";

import { logger } from "../logger";
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

// Budget large : le premier test d'un lancement absorbe le démarrage de l'application (jusqu'à plusieurs secondes).
async function waitUntil(condition: () => boolean, timeoutMs = 20000) {
  for (const deadline = Date.now() + timeoutMs; !condition() && Date.now() < deadline; ) await new Promise((resolve) => setTimeout(resolve, 25));
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

  it("POST /SNUpport/upload : répond même quand la suppression d'un fichier temporaire échoue", async () => {
    // Type refusé : la route purge ses fichiers avant de répondre.
    (getMimeFromFile as jest.Mock).mockResolvedValue("text/html");
    const isUploadTempFile = (filePath: unknown) => typeof filePath === "string" && tempFiles.includes(filePath);
    const denied = () => Object.assign(new Error("suppression refusée"), { code: "EACCES" });
    const { unlinkSync } = fs;
    const { rm } = fs.promises;
    const unlinkSyncSpy = jest.spyOn(fs, "unlinkSync").mockImplementation((filePath) => {
      if (isUploadTempFile(filePath)) throw denied();
      return unlinkSync(filePath);
    });
    const rmSpy = jest.spyOn(fs.promises, "rm").mockImplementation(async (filePath, options) => {
      if (isUploadTempFile(filePath)) throw denied();
      return rm(filePath, options);
    });
    const agent = new http.Agent({ keepAlive: true });
    try {
      const port = await listen(getAppHelper(routes[0].user));
      const req = post(port, routes[0].path, agent);
      req.setTimeout(10000, () => req.destroy(new Error("pas de réponse")));
      req.end(Buffer.concat([routes[0].smallFile(), Buffer.from(`--${BOUNDARY}--\r\n`)]));
      const [res] = (await once(req, "response")) as [http.IncomingMessage];
      res.resume();
      await once(res, "end");
      expect(res.statusCode).toBe(500);
    } finally {
      agent.destroy();
      unlinkSyncSpy.mockRestore();
      rmSpy.mockRestore();
      for (const file of tempFiles) fs.rmSync(file, { force: true });
    }
  });
});

describe("abandonableFileUpload", () => {
  const LIMIT = 1024 * 1024;
  let uploadDir: string;
  let server: http.Server | undefined;
  let handlerCalls: number;

  beforeEach(() => {
    uploadDir = fs.mkdtempSync(pathModule.join(os.tmpdir(), "lot-p29-coupure-"));
    handlerCalls = 0;
  });

  afterEach(async () => {
    server?.closeAllConnections();
    await new Promise((resolve) => (server ? server.close(resolve) : resolve(undefined)));
    server = undefined;
    fs.rmSync(uploadDir, { recursive: true, force: true });
    jest.restoreAllMocks();
  });

  async function serve(upload: express.RequestHandler, handler: express.RequestHandler = (_req, res) => void res.send({ ok: true })) {
    const app = express();
    app.post("/upload", upload, (req, res, next) => {
      handlerCalls++;
      handler(req, res, next);
    });
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    return (server.address() as AddressInfo).port;
  }

  function postUpload(port: number, agent: http.Agent, contentType = `multipart/form-data; boundary=${BOUNDARY}`) {
    return http.request({ host: "127.0.0.1", port, method: "POST", path: "/upload", agent, headers: { "content-type": contentType } });
  }

  it("refuse à la compilation des options mal orthographiées", () => {
    // @ts-expect-error `limit` au lieu de `limits` : la limite de taille disparaîtrait sans erreur.
    expect(typeof abandonableFileUpload({ limit: { fileSize: LIMIT }, useTempFiles: true, tempFileDir: uploadDir })).toBe("function");
  });

  it("rend la main au gestionnaire sans laisser son interception de req.pipe (requête sans fichier)", async () => {
    const destination = new PassThrough();
    let fileListeners = -1;
    const port = await serve(abandonableFileUpload({ limits: { fileSize: LIMIT }, useTempFiles: true, tempFileDir: uploadDir }), (req, res) => {
      req.pipe(destination);
      fileListeners = destination.listenerCount("file");
      res.send({ ok: true });
    });
    const agent = new http.Agent({ keepAlive: true });
    try {
      const req = postUpload(port, agent, "text/plain");
      req.end("pas de fichier");
      const [res] = (await once(req, "response")) as [http.IncomingMessage];
      res.resume();
      await once(res, "end");
      expect(res.statusCode).toBe(200);
    } finally {
      agent.destroy();
    }
    expect(fileListeners).toBe(0);
  });

  it("journalise une erreur d'analyse survenue après la réponse", async () => {
    const warn = jest.spyOn(logger, "warn");
    const port = await serve(
      abandonableFileUpload({
        limits: { fileSize: LIMIT },
        useTempFiles: true,
        tempFileDir: uploadDir,
        limitHandler: (_req, res) => void res.status(413).send({ ok: false }),
      }),
    );
    const agent = new http.Agent({ keepAlive: true });
    try {
      const req = postUpload(port, agent);
      req.on("error", () => {});
      req.write(Buffer.concat([filePart("gros", "gros.bin", "application/octet-stream"), Buffer.alloc(2 * LIMIT, "a")]));
      const [res] = (await once(req, "response")) as [http.IncomingMessage];
      res.resume();
      await once(res, "end");
      expect(res.statusCode).toBe(413);
      // Le corps s'arrête en pleine partie : le parseur signale une erreur, alors que la réponse est déjà partie.
      req.end();
      await waitUntil(() => warn.mock.calls.length > 0, 5000);
    } finally {
      agent.destroy();
    }
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("Unexpected end of form"));
    expect(handlerCalls).toBe(0);
  });

  // Coupure en plein fichier sous la limite : le délai d'envoi d'express-fileupload abandonne ce fichier et passe la main.
  it("purge le fichier inachevé et n'appelle pas le gestionnaire quand la connexion est coupée sous la limite", async () => {
    const port = await serve(abandonableFileUpload({ limits: { fileSize: LIMIT }, useTempFiles: true, tempFileDir: uploadDir, uploadTimeout: 300 }));
    const agent = new http.Agent({ keepAlive: true });
    const req = postUpload(port, agent);
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
