/**
 * Lot P29 — dépôts de fichiers : plafond du nombre de fichiers par requête et purge des fichiers
 * temporaires sur tous les chemins de réponse.
 */
import { once } from "events";
import express from "express";
import fs from "fs";
import http from "http";
import { AddressInfo } from "net";
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

const servers: http.Server[] = [];
afterEach(async () => {
  for (const server of servers.splice(0)) {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});

// Serveur lié à 127.0.0.1, l'adresse que vise supertest. `request(app)` écoute sur toutes les interfaces : sous macOS, un
// autre processus peut alors se lier explicitement à 127.0.0.1 sur le même port, et il reçoit les requêtes du test à sa
// place (un 404 étranger au lieu du 413 attendu). Sur 127.0.0.1, ce port ne peut plus être pris.
async function localServer(app: express.Express) {
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  await once(server, "listening");
  return server;
}

function uploadedFile(content = "x"): UploadedFile {
  const tempFilePath = path.join(workDir, `${Date.now()}-${Math.random()}`);
  fs.writeFileSync(tempFilePath, content);
  return { name: "fichier", tempFilePath } as UploadedFile;
}

async function waitUntil(condition: () => boolean, attempts = 40) {
  for (let i = 0; i < attempts && !condition(); i++) await new Promise((resolve) => setTimeout(resolve, 25));
}

function attachFiles(req: request.Test, count: number, size = 1) {
  for (let i = 0; i < count; i++) req.attach(`file${i}`, Buffer.alloc(size, "a"), `piece-${i}.txt`);
  return req;
}

const BOUNDARY = "lot-p29";

/** Délimiteur et en-têtes d'une partie fichier d'un corps multipart, sans son contenu. */
function filePartHeader(name: string) {
  return Buffer.from(`--${BOUNDARY}\r\nContent-Disposition: form-data; name="${name}"; filename="${name}.txt"\r\nContent-Type: text/plain\r\n\r\n`);
}

describe("serveur de test", () => {
  it("reçoit ses requêtes même si un autre serveur se lie ensuite au même port sur 127.0.0.1", async () => {
    const app = express();
    app.get("/", (_req, res) => res.send("serveur du test"));
    const server = await localServer(app);
    const { port } = server.address() as AddressInfo;
    const other = http.createServer((_req, res) => res.writeHead(404).end("autre serveur"));
    const otherListening = await new Promise<boolean>((resolve) => {
      other.once("error", () => resolve(false));
      other.listen(port, "127.0.0.1", () => resolve(true));
    });
    try {
      const res = await request(server).get("/");
      expect(res.text).toBe("serveur du test");
    } finally {
      if (otherListening) await new Promise((resolve) => other.close(resolve));
    }
  });
});

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
      const res = await attachFiles(request(await localServer(app)).post("/upload"), count);
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(count);
    }
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
  });

  it.each([[400], [403], [500]])("purge les fichiers quand le gestionnaire répond %i sans les supprimer", async (status) => {
    const res = await attachFiles(
      request(await localServer(app))
        .post("/upload")
        .query({ status }),
      2,
    );
    expect(res.status).toBe(status);
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
  });

  it("accepte exactement le plafond de fichiers", async () => {
    const res = await attachFiles(request(await localServer(app)).post("/upload"), MAX_UPLOAD_FILES);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(MAX_UPLOAD_FILES);
  });

  it("refuse en 413 une requête au-dessus du plafond et ne garde aucun fichier", async () => {
    const res = await attachFiles(request(await localServer(app)).post("/upload"), MAX_UPLOAD_FILES + 5);
    expect(res.status).toBe(413);
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
  });

  it("refuse en 413 un fichier plus gros que la limite de taille et ne garde aucun fichier", async () => {
    const res = await attachFiles(request(await localServer(app)).post("/upload"), 1, MAX_FILE_SIZE + 1);
    expect(res.status).toBe(413);
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
  });
});

describe("tempFileUpload : fichier trop gros suivi d'autres fichiers (délai d'envoi court)", () => {
  let uploadDir: string;
  let app: express.Express;
  let handlerCalls: number;
  beforeEach(() => {
    uploadDir = fs.mkdtempSync(path.join(workDir, "upload-"));
    handlerCalls = 0;
    app = express();
    app.post("/upload", ...tempFileUpload({ tempFileDir: uploadDir, uploadTimeout: 300 }), (req, res) => {
      handlerCalls++;
      res.send({ ok: true });
    });
  });

  it("répond 413 en JSON, ne garde aucun fichier et n'appelle pas le gestionnaire", async () => {
    const req = request(await localServer(app))
      .post("/upload")
      .attach("gros", Buffer.alloc(MAX_FILE_SIZE + 1, "a"), "gros.txt");
    for (let i = 0; i < 20; i++) req.attach(`petit${i}`, Buffer.alloc(1, "a"), `petit-${i}.txt`);
    const res = await req;
    expect(res.status).toBe(413);
    expect(res.body).toEqual({ ok: false, code: "INVALID_BODY" });
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
    expect(handlerCalls).toBe(0);
  });

  // Pas de supertest ici : il envoie `Connection: close`, Node ferme alors la socket dès le 413 pendant que le client écrit
  // encore, et le client perd la réponse (EPIPE ou ECONNRESET) selon le timing. En keep-alive, le serveur lit tout ce qui
  // est envoyé ; le corps s'arrête ensuite en plein fichier « moyen », que seul le délai d'envoi peut abandonner.
  it("ne laisse pas de fichier partiel quand un fichier plus gros que la limite précède un fichier moyen", async () => {
    const server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    const { port } = server.address() as AddressInfo;
    const agent = new http.Agent({ keepAlive: true });
    const req = http.request({ host: "127.0.0.1", port, method: "POST", path: "/upload", agent, headers: { "content-type": `multipart/form-data; boundary=${BOUNDARY}` } });
    try {
      const response = once(req, "response");
      // « gros » reste ouvert : sa partie ne se termine qu'avec le délimiteur de la suivante, envoyé après la réponse.
      req.write(Buffer.concat([filePartHeader("petit"), Buffer.alloc(10, "a"), Buffer.from("\r\n"), filePartHeader("gros"), Buffer.alloc(MAX_FILE_SIZE + 1, "a")]));
      const [res] = (await response) as [http.IncomingMessage];
      expect(res.statusCode).toBe(413);
      res.resume();
      await once(res, "end");
      await new Promise<void>((resolve, reject) =>
        req.write(Buffer.concat([Buffer.from("\r\n"), filePartHeader("moyen"), Buffer.alloc(1024 * 1024, "a")]), (error) => (error ? reject(error) : resolve())),
      );
      // La purge de fin de réponse a précédé la fin de « gros » : il ne peut être purgé qu'après l'abandon de « moyen »
      // partiel. Un dossier vide prouve donc que ce fichier partiel a existé, puis a été supprimé.
      await waitUntil(() => fs.readdirSync(uploadDir).length === 0, 200);
      expect(fs.readdirSync(uploadDir)).toEqual([]);
      expect(handlerCalls).toBe(0);
    } finally {
      req.destroy();
      agent.destroy();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

// Le corps s'arrête en plein fichier trop gros : sa partie ne se termine jamais. Délai d'envoi par défaut (60 s), que le
// test n'attend pas : seule la fermeture de la connexion peut purger le fichier tronqué.
describe("tempFileUpload : fichier plus gros que la limite dont la partie ne se termine pas", () => {
  let uploadDir: string;
  let server: http.Server;
  let handlerCalls: number;
  beforeEach(async () => {
    uploadDir = fs.mkdtempSync(path.join(workDir, "upload-"));
    handlerCalls = 0;
    const app = express();
    app.post("/upload", ...tempFileUpload({ tempFileDir: uploadDir }), (_req, res) => {
      handlerCalls++;
      res.send({ ok: true });
    });
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
  });
  afterEach(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });

  /** Envoie un seul fichier de deux fois la limite, sans le délimiteur qui terminerait sa partie. */
  function sendUnfinishedFile(agent: http.Agent, headers: http.OutgoingHttpHeaders = {}) {
    const { port } = server.address() as AddressInfo;
    const req = http.request({
      host: "127.0.0.1",
      port,
      method: "POST",
      path: "/upload",
      agent,
      headers: { "content-type": `multipart/form-data; boundary=${BOUNDARY}`, ...headers },
    });
    req.write(Buffer.concat([filePartHeader("gros"), Buffer.alloc(2 * MAX_FILE_SIZE, "a")]));
    return req;
  }

  it("purge le fichier tronqué quand le client coupe la connexion après le 413", async () => {
    const agent = new http.Agent({ keepAlive: true });
    const req = sendUnfinishedFile(agent);
    try {
      const [res] = (await once(req, "response")) as [http.IncomingMessage];
      expect(res.statusCode).toBe(413);
      res.resume();
      await once(res, "end");
    } finally {
      req.destroy();
      agent.destroy();
    }
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0, 200);
    expect(fs.readdirSync(uploadDir)).toEqual([]);
    expect(handlerCalls).toBe(0);
  });

  // Avec `Connection: close`, le serveur ferme la socket dès le 413 : le client perd la réponse ou non selon le timing.
  it("purge le fichier tronqué quand le serveur ferme la connexion après le 413", async () => {
    const agent = new http.Agent({ keepAlive: false });
    const req = sendUnfinishedFile(agent, { connection: "close" });
    req.on("error", () => {});
    req.on("response", (res: http.IncomingMessage) => res.resume());
    await new Promise((resolve) => req.once("close", resolve));
    agent.destroy();
    await waitUntil(() => fs.readdirSync(uploadDir).length === 0, 200);
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
        return attachFiles(
          request(await localServer(await getAppHelperWithAcl(young, "young")))
            .post("/young/file/cniFiles")
            .field("body", "{}"),
          files,
        );
      },
    },
    {
      name: "POST /young/:id/documents/:key (body absent, 500)",
      status: 500,
      send: async (files: number) => {
        const young = await createYoungHelper(getNewYoungFixture());
        return attachFiles(request(await localServer(await getAppHelperWithAcl(young, "young"))).post(`/young/${young._id}/documents/cniFiles`), files);
      },
    },
    {
      name: "POST /application/:id/file/:key (candidature inconnue, 404)",
      status: 404,
      send: async (files: number) =>
        attachFiles(
          request(await localServer(getAppHelper()))
            .post(`/application/${UNKNOWN_ID}/file/contractAvenantFiles`)
            .field("body", "{}"),
          files,
        ),
    },
    {
      name: "POST /referent/file/:key (volontaire inconnu, 404)",
      status: 404,
      send: async (files: number) =>
        attachFiles(
          request(await localServer(getAppHelper()))
            .post("/referent/file/cniFiles")
            .field("body", JSON.stringify({ names: ["a.txt"], youngId: UNKNOWN_ID })),
          files,
        ),
    },
  ];

  // Fichiers temporaires ouverts par express-fileupload pendant le test. /tmp est partagé avec les autres processus : ceux
  // qu'ils y déposent pendant le test ne doivent pas compter.
  let tempFiles: string[];
  let createWriteStream: jest.SpyInstance;
  beforeEach(() => {
    tempFiles = [];
    const original = fs.createWriteStream;
    createWriteStream = jest.spyOn(fs, "createWriteStream").mockImplementation((filePath, options) => {
      if (typeof filePath === "string" && /^\/tmp\/tmp-\d+-\d+$/.test(filePath)) tempFiles.push(filePath);
      return original(filePath, options);
    });
  });
  afterEach(() => createWriteStream.mockRestore());

  const remainingTempFiles = () => tempFiles.filter((file) => fs.existsSync(file));

  it.each(routes)("$name : aucun fichier ne reste dans /tmp", async ({ send, status }) => {
    const res = await send(2);
    expect(res.status).toBe(status);
    expect(tempFiles).toHaveLength(2);
    await waitUntil(() => remainingTempFiles().length === 0);
    expect(remainingTempFiles()).toEqual([]);
  });

  it.each(routes)("$name : une requête au-dessus du plafond est refusée en 413", async ({ send }) => {
    const res = await send(MAX_UPLOAD_FILES + 5);
    expect(res.status).toBe(413);
    // busboy ignore les fichiers au-delà de MAX_UPLOAD_FILES + 1 sans les écrire.
    expect(tempFiles).toHaveLength(MAX_UPLOAD_FILES + 1);
    await waitUntil(() => remainingTempFiles().length === 0);
    expect(remainingTempFiles()).toEqual([]);
  });
});
