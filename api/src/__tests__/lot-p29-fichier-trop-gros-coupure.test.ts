/**
 * Lot P29 (suite) — routes de dépôt montées sans `tempFileUpload()` : `POST /SNUpport/upload` et
 * `POST /plan-marketing/import`. Elles n'ont pas de gestionnaire de dépassement : un fichier plus gros que la limite
 * est tronqué sans réponse. Si sa partie ne se termine pas, le fichier tronqué doit être purgé quand le client coupe la
 * connexion, avec les fichiers déjà reçus, et la requête abandonnée ne doit pas être traitée. Un envoi complet reste
 * traité comme avant.
 */
import { once } from "events";
import fs from "fs";
import http from "http";
import { AddressInfo } from "net";
import express from "express";
import { Types } from "mongoose";
import { MIME_TYPES, ROLES } from "snu-lib";

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
