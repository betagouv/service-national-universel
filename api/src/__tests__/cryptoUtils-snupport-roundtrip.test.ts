/**
 * PM23 : contrairement aux autres suites qui exercent POST /SNUpport/upload et GET /SNUpport/s3file/:id
 * (et les routes équivalentes des autres contrôleurs), celles-ci mockent toutes `../cryptoUtils` — le
 * vrai `encrypt`/`decrypt` de `api/src/cryptoUtils.ts` n'y est donc jamais exécuté. Cette suite ne mocke
 * que le stockage S3 (en mémoire) et le support externe, pas le chiffrement : elle prouve que le contenu
 * déposé via la vraie route survit, identique, à un aller-retour chiffrement/déchiffrement réel — avec le
 * secret explicite `FILE_ENCRYPTION_SECRET_SUPPORT` (seul appelant de `cryptoUtils` à ne pas utiliser le
 * secret par défaut), dans les deux états du flag `ENABLE_FILE_ENCRYPTION_V1`.
 */
import request from "supertest";
import { Types } from "mongoose";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { getNewReferentFixture } from "./fixtures/referent";
import { config } from "../config";

const mockRedisStore: Record<string, string> = {};
jest.mock("../redis", () => {
  const client = {
    setEx: (key: string, _ttl: number, value: string) => {
      mockRedisStore[key] = value;
      return Promise.resolve("OK");
    },
    get: (key: string) => Promise.resolve(mockRedisStore[key] ?? null),
    del: (key: string) => {
      const existed = key in mockRedisStore;
      delete mockRedisStore[key];
      return Promise.resolve(existed ? 1 : 0);
    },
    incrBy: (key: string, increment: number) => {
      mockRedisStore[key] = String(Number(mockRedisStore[key] ?? 0) + increment);
      return Promise.resolve(Number(mockRedisStore[key]));
    },
    expire: () => Promise.resolve(true),
  };
  return { getRedisClient: () => client, initRedisClient: () => Promise.resolve(), closeRedisClient: () => Promise.resolve() };
});

// Faux S3 en mémoire : seul le stockage objet est simulé, pas le chiffrement (contrairement aux
// autres suites touchant SNUpport.ts, cf. en-tête du fichier).
const fakeBucket = new Map<string, Buffer>();
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  uploadFile: jest.fn(async (path: string, file: { data: Buffer }) => {
    fakeBucket.set(path, file.data);
    return { Location: `https://support-bucket.example/${path}`, key: path };
  }),
  getFile: jest.fn(async (path: string) => ({ Body: fakeBucket.get(path) })),
}));
jest.mock("../utils/virusScanner", () => ({
  scanFile: jest.fn().mockResolvedValue({ infected: false }),
}));
jest.mock("../utils/file", () => ({
  ...jest.requireActual("../utils/file"),
  getMimeFromFile: jest.fn().mockResolvedValue("application/pdf"),
}));
jest.mock("../SNUpport", () => ({
  api: jest.fn(),
  getCustomerIdByEmail: jest.fn(),
}));
jest.mock("../services/support", () => ({
  getUserAttributes: jest.fn().mockResolvedValue([]),
}));
jest.mock("../sentry", () => ({
  initSentry: jest.fn(),
  capture: jest.fn(),
  captureMessage: jest.fn(),
}));
jest.mock("../slack", () => ({
  error: jest.fn(),
  info: jest.fn(),
  success: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SNUpport = require("../SNUpport");

jest.setTimeout(30000);

const user = getNewReferentFixture({ email: "owner@example.org" }) as any;
const supportWriteAcl = [{ resource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.WRITE, policy: [] }];
const owner = { ...user, _id: new Types.ObjectId(), acl: supportWriteAcl };

const PDF = Buffer.from("%PDF-1.4\ncontenu de pièce jointe de support, à chiffrer réellement (PM23)\n");

/** Le support externe voit un seul ticket, dont le message référence `path` : suffit pour que
 * `isAttachmentOwner` (SNUpport.ts) laisse l'utilisateur relire ce qu'il vient de déposer. */
const mockSupportTicketWithAttachment = (path: string) => {
  const ticketId = new Types.ObjectId().toString();
  SNUpport.api.mockImplementation(async (apiPath: string) => {
    if (apiPath.startsWith("/v0/ticket?email=")) return { ok: true, data: [{ _id: ticketId, subject: "t", status: "OPEN" }] };
    if (apiPath.startsWith("/v0/ticket/withMessages")) return { ok: true, data: { ticket: { _id: ticketId }, messages: [{ files: [{ path }] }] } };
    return { ok: false };
  });
};

const originalSupportSecret = config.FILE_ENCRYPTION_SECRET_SUPPORT;
beforeEach(() => {
  resetAppAuth();
  jest.clearAllMocks();
  fakeBucket.clear();
  for (const key of Object.keys(mockRedisStore)) delete mockRedisStore[key];
  // Ni FILE_ENCRYPTION_SECRET_SUPPORT ni FILE_ENCRYPTION_SECRET ne sont définis dans l'environnement
  // de test (c'est d'ailleurs pourquoi toutes les autres suites touchant ce contrôleur mockent
  // `cryptoUtils` plutôt que d'appeler le vrai `encrypt`/`decrypt`).
  config.FILE_ENCRYPTION_SECRET_SUPPORT = "secret-support-de-test-0123456789";
});
afterAll(() => {
  config.FILE_ENCRYPTION_SECRET_SUPPORT = originalSupportSecret;
});

describe("PM23 — aller-retour chiffrement réel sur la vraie route SNUpport (secret explicite)", () => {
  it.each([false, true])("rend le contenu déposé identique après téléchargement, ENABLE_FILE_ENCRYPTION_V1=%s", async (flag) => {
    const originalFlag = config.ENABLE_FILE_ENCRYPTION_V1;
    config.ENABLE_FILE_ENCRYPTION_V1 = flag;
    try {
      const uploadRes = await request(getAppHelper(owner)).post("/SNUpport/upload").attach("file0", PDF, { filename: "justificatif.pdf", contentType: "application/pdf" });
      expect(uploadRes.status).toBe(200);
      const path = uploadRes.body.data[0].path;

      // L'objet stocké n'est jamais le clair : le chiffrement réel a bien eu lieu avant l'écriture S3.
      expect(fakeBucket.get(path)?.equals(PDF)).toBe(false);

      mockSupportTicketWithAttachment(path);
      const downloadRes = await request(getAppHelper(owner)).get(`/SNUpport/s3file/${path.split("/")[1]}`);
      expect(downloadRes.status).toBe(200);
      expect(Buffer.from(downloadRes.body.data).equals(PDF)).toBe(true);
    } finally {
      config.ENABLE_FILE_ENCRYPTION_V1 = originalFlag;
    }
  });

  it("l'objet stocké pour ce secret explicite reste au format legacy même quand le flag est actif (décision de migration PM23)", async () => {
    const originalFlag = config.ENABLE_FILE_ENCRYPTION_V1;
    config.ENABLE_FILE_ENCRYPTION_V1 = true;
    try {
      const uploadRes = await request(getAppHelper(owner)).post("/SNUpport/upload").attach("file0", PDF, { filename: "justificatif.pdf", contentType: "application/pdf" });
      expect(uploadRes.status).toBe(200);
      const path = uploadRes.body.data[0].path;
      const stored = fakeBucket.get(path) as Buffer;
      // Format legacy : pas d'en-tête magique "SNU1" en tête d'objet (cf. isV1Format, cryptoUtils.ts).
      expect(stored.subarray(0, 4).toString("utf-8")).not.toEqual("SNU1");
    } finally {
      config.ENABLE_FILE_ENCRYPTION_V1 = originalFlag;
    }
  });
});
