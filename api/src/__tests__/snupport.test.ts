import request from "supertest";
import { Types } from "mongoose";
import passport from "passport";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "snu-lib";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { dbConnect, dbClose } from "./helpers/db";
import { getNewReferentFixture } from "./fixtures/referent";
import getNewYoungFixture from "./fixtures/young";
import { createYoungHelper } from "./helpers/young";

// Redis en mémoire : les pièces jointes déposées et le quota de dépôt y sont conservés.
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
let mockUploadCount = 0;
jest.mock("../utils", () => ({
  ...jest.requireActual("../utils"),
  uploadFile: jest.fn(async (path: string) => {
    mockUploadCount += 1;
    return { Location: `https://support-bucket.example/${path}`, key: path };
  }),
  getFile: jest.fn(async () => ({ Body: Buffer.from("contenu") })),
}));
jest.mock("../cryptoUtils", () => ({
  encrypt: (buffer: Buffer) => buffer,
  decrypt: (buffer: Buffer) => buffer,
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
// Sentry n'est pas initialisé en test : sa capture bloque la réponse HTTP.
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
// optionalAuth lit un cookie JWT : on pilote directement l'utilisateur qu'il expose au contrôleur.
let mockOptionalAuthUser: any = null;
jest.mock("../middlewares/optionalAuth", () => ({
  __esModule: true,
  default: (req: any, _res: any, next: any) => {
    if (mockOptionalAuthUser) req.user = mockOptionalAuthUser;
    next();
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SNUpport = require("../SNUpport");

jest.setTimeout(30000);

const OWN_TICKET_ID = new Types.ObjectId().toString();
const OTHER_TICKET_ID = new Types.ObjectId().toString();

const user = getNewReferentFixture({ email: "owner@example.org" }) as any;

// Réponse de /v0/ticket?email= : la liste, exhaustive, des tickets dont l'utilisateur est le contact.
const ownTicketsResponse = { ok: true, data: [{ _id: OWN_TICKET_ID, subject: "Mon ticket", status: "OPEN" }] };

// Pièces jointes présentes dans les messages des tickets, côté support.
const OWN_ATTACHMENT_ID = "0b7e1a64-2a4d-4c55-9a7e-5b1f3c6d8e90.pdf";
const OTHER_ATTACHMENT_ID = "9f3c2b1a-7d6e-4f5a-8b9c-0d1e2f3a4b5c.pdf";
const messagesByTicket: Record<string, any[]> = {
  [OWN_TICKET_ID]: [{ files: [{ name: "moi.pdf", url: "https://s3/x", path: `message/${OWN_ATTACHMENT_ID}` }] }],
  [OTHER_TICKET_ID]: [{ files: [{ name: "cni.pdf", url: "https://s3/y", path: `message/${OTHER_ATTACHMENT_ID}` }] }],
};

const mockSNUpport = () => {
  SNUpport.api.mockImplementation(async (path: string, options?: { body?: string }) => {
    if (path.startsWith("/v0/ticket?email=")) return ownTicketsResponse;
    if (path.startsWith("/v0/ticket/withMessages")) {
      const ticketId = path.split("ticketId=")[1];
      return { ok: true, data: { ticket: { _id: ticketId }, messages: messagesByTicket[ticketId] || [] } };
    }
    if (path === "/v0/message") {
      // Comme snupport-api : le ticket créé porte le groupe de contact dérivé de l'attribut « role ».
      const body = JSON.parse(options?.body || "{}");
      const role = (body.attributes || []).find((attribute: any) => attribute.name === "role")?.value;
      return { ok: true, data: { ticket: { _id: OWN_TICKET_ID, contactGroup: role || "unknown", contactEmail: body.email }, message: {} } };
    }
    if (path.startsWith("/knowledge-base/")) return { ok: true, data: [] };
    if (path === "/feedback") return { ok: true };
    return { ok: false };
  });
};

beforeEach(() => {
  resetAppAuth();
  jest.clearAllMocks();
  mockSNUpport();
  mockOptionalAuthUser = null;
  mockUploadCount = 0;
  for (const key of Object.keys(mockRedisStore)) delete mockRedisStore[key];
});

const calledPaths = () => SNUpport.api.mock.calls.map((call: any[]) => call[0]);

describe("GET /SNUpport/ticket/:id", () => {
  it("should return 400 when the id is invalid", async () => {
    const res = await request(await getAppHelper(user)).get("/SNUpport/ticket/invalid-id");
    expect(res.status).toBe(400);
  });

  it("should return 403 when the ticket does not belong to the user", async () => {
    const res = await request(await getAppHelper(user)).get(`/SNUpport/ticket/${OTHER_TICKET_ID}`);
    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, code: "OPERATION_UNAUTHORIZED" });
    expect(calledPaths().some((path: string) => path.startsWith("/v0/ticket/withMessages"))).toBe(false);
  });

  it("should return the ticket when its id is spelled in uppercase hexadecimal", async () => {
    const res = await request(await getAppHelper(user)).get(`/SNUpport/ticket/${OWN_TICKET_ID.toUpperCase()}`);
    expect(res.status).toBe(200);
  });

  it("should return the ticket when it belongs to the user", async () => {
    const res = await request(await getAppHelper(user)).get(`/SNUpport/ticket/${OWN_TICKET_ID}`);
    expect(res.status).toBe(200);
    expect(calledPaths().some((path: string) => path.startsWith(`/v0/ticket/withMessages?ticketId=${OWN_TICKET_ID}`))).toBe(true);
  });
});

describe("POST /SNUpport/ticket/:id/message", () => {
  it("should return 403 and post nothing when the ticket does not belong to the user", async () => {
    const res = await request(await getAppHelper(user))
      .post(`/SNUpport/ticket/${OTHER_TICKET_ID}/message`)
      .send({ message: "coucou" });
    expect(res.status).toBe(403);
    expect(calledPaths().includes("/v0/message")).toBe(false);
  });

  it("should post the message when the ticket belongs to the user", async () => {
    const res = await request(await getAppHelper(user))
      .post(`/SNUpport/ticket/${OWN_TICKET_ID}/message`)
      .send({ message: "coucou" });
    expect(res.status).toBe(200);
    expect(calledPaths().includes("/v0/message")).toBe(true);
  });
});

describe("GET /SNUpport/knowledgeBase/search", () => {
  const search = (query: string) => request(getAppHelper()).get(`/SNUpport/knowledgeBase/search?${query}`);

  it("should search the public knowledge base without authentication", async () => {
    const res = await search("search=mot&restriction=public");
    expect(res.status).toBe(200);
    expect(calledPaths()).toEqual(["/knowledge-base/public/search?search=mot&status=PUBLISHED"]);
  });

  it("should reject a restriction outside the knowledge base roles", async () => {
    const res = await search("search=mot&restriction=agent");
    expect(res.status).toBe(400);
    expect(SNUpport.api).not.toHaveBeenCalled();
  });

  it("should reject a restriction escaping the knowledge base path towards the trusted /v0 routes", async () => {
    const res = await search(`search=x&restriction=${encodeURIComponent("../v0/ticket?email=victime@example.com#")}`);
    expect(res.status).toBe(400);
    expect(SNUpport.api).not.toHaveBeenCalled();
  });

  it("should reject a non-public restriction for an anonymous visitor", async () => {
    const res = await search("search=mot&restriction=referent");
    expect(res.status).toBe(403);
    expect(SNUpport.api).not.toHaveBeenCalled();
  });

  it("should accept a non-public restriction for an authenticated user", async () => {
    mockOptionalAuthUser = user;
    const res = await search("search=mot&restriction=referent");
    expect(res.status).toBe(200);
    expect(calledPaths()).toEqual(["/knowledge-base/referent/search?search=mot&status=PUBLISHED"]);
  });

  it("should encode the search terms instead of letting them forge the query string", async () => {
    const res = await search(`search=${encodeURIComponent("a&status=DRAFT")}&restriction=public`);
    expect(res.status).toBe(200);
    expect(calledPaths()).toEqual(["/knowledge-base/public/search?search=a%26status%3DDRAFT&status=PUBLISHED"]);
  });
});

// --- Lot S (audit du 21/09/2026) ---

const supportWriteAcl = [{ resource: PERMISSION_RESOURCES.SUPPORT, action: PERMISSION_ACTIONS.WRITE, policy: [] }];
const owner = { ...user, _id: new Types.ObjectId(), acl: supportWriteAcl };
const otherUser = { ...getNewReferentFixture({ email: "other@example.org" }), _id: new Types.ObjectId(), acl: supportWriteAcl } as any;

const PDF = Buffer.from("%PDF-1.4\n%lot S\n");

const upload = (as: any, count = 1, filename = "justificatif.pdf") => {
  let req = request(getAppHelper(as)).post("/SNUpport/upload");
  for (let i = 0; i < count; i++) req = req.attach(`file${i}`, PDF, { filename, contentType: "application/pdf" });
  return req;
};

const relayedMessageBody = () => {
  const call = SNUpport.api.mock.calls.find((c: any[]) => c[0] === "/v0/message");
  return call ? JSON.parse(call[1].body) : undefined;
};

describe("POST /SNUpport/upload (M38)", () => {
  it("should require an authenticated young or referent", async () => {
    // Le mock de passport laisse passer toute requête : on observe qu'il a bien été sollicité, avec les bons types.
    (passport as any).lastTypeCalledOnAuthenticate = undefined;
    const res = await upload(owner);
    expect((passport as any).lastTypeCalledOnAuthenticate).toEqual(["referent", "young"]);
    expect(res.status).toBe(200);
  });

  it("should store nothing when the caller is neither a young nor a referent", async () => {
    (passport as any).authStrategy = "anonymous";
    const res = await upload(owner);
    expect(res.status).not.toBe(200);
    expect(mockUploadCount).toBe(0);
  });

  it("should reject a request carrying too many files at once", async () => {
    const res = await upload(owner, 11);
    expect(res.status).toBe(400);
    expect(mockUploadCount).toBe(0);
  });

  it("should cap the number of files a user can deposit per window", async () => {
    for (let i = 0; i < 2; i++) expect((await upload(owner, 10)).status).toBe(200);
    const res = await upload(owner, 1);
    expect(res.status).toBe(429);
    expect(mockUploadCount).toBe(20);
    // Le quota est propre à chaque utilisateur.
    expect((await upload(otherUser, 1)).status).toBe(200);
  });

  it("should derive the storage extension from the detected type, not from the client file name", async () => {
    const res = await upload(owner, 1, "page.html");
    expect(res.status).toBe(200);
    expect(res.body.data[0].path).toMatch(/^message\/[0-9a-f-]{36}\.pdf$/);
  });
});

describe("Pièces jointes des tickets (M36)", () => {
  const forged = [{ name: "a.pdf", url: "https://evil.example/phishing", path: `message/${OTHER_ATTACHMENT_ID}` }];

  it("should refuse, on POST /ticket/:id/message, a file the user did not upload", async () => {
    const res = await request(getAppHelper(owner)).post(`/SNUpport/ticket/${OWN_TICKET_ID}/message`).send({ message: "pj", files: forged });
    expect(res.status).toBe(400);
    expect(calledPaths().includes("/v0/message")).toBe(false);
  });

  it("should refuse, on POST /ticket, a file the user did not upload", async () => {
    const res = await request(getAppHelper(owner)).post("/SNUpport/ticket").send({ subject: "s", message: "m", files: forged });
    expect(res.status).toBe(400);
    expect(calledPaths().includes("/v0/message")).toBe(false);
  });

  it("should refuse a file uploaded by another user", async () => {
    const uploaded = (await upload(otherUser)).body.data;
    const res = await request(getAppHelper(owner)).post(`/SNUpport/ticket/${OWN_TICKET_ID}/message`).send({ message: "pj", files: uploaded });
    expect(res.status).toBe(400);
    expect(calledPaths().includes("/v0/message")).toBe(false);
  });

  it("should relay the server-side record of the user's own upload, ignoring the client's url and name", async () => {
    const [uploaded] = (await upload(owner)).body.data;
    const res = await request(getAppHelper(owner))
      .post(`/SNUpport/ticket/${OWN_TICKET_ID}/message`)
      .send({ message: "pj", files: [{ ...uploaded, name: "autre.pdf", url: "https://evil.example/phishing" }] });
    expect(res.status).toBe(200);
    expect(relayedMessageBody().files).toEqual([{ name: "justificatif.pdf", url: `https://support-bucket.example/${uploaded.path}`, path: uploaded.path }]);
  });

  it("should accept an upload only once", async () => {
    const uploaded = (await upload(owner)).body.data;
    expect((await request(getAppHelper(owner)).post("/SNUpport/ticket").send({ subject: "s", message: "m", files: uploaded })).status).toBe(200);
    SNUpport.api.mockClear();
    const res = await request(getAppHelper(owner)).post(`/SNUpport/ticket/${OWN_TICKET_ID}/message`).send({ message: "pj", files: uploaded });
    expect(res.status).toBe(400);
    expect(calledPaths().includes("/v0/message")).toBe(false);
  });
});

describe("POST /SNUpport/ticket/form (M36, M37)", () => {
  const YOUNG_EMAIL = `lot-s-${Date.now()}@example.org`;
  const form = (fields: Record<string, unknown> = {}) =>
    request(getAppHelper())
      .post("/SNUpport/ticket/form")
      .send({
        email: YOUNG_EMAIL,
        role: "young",
        subject: "x",
        message: "x",
        firstName: "a",
        lastName: "b",
        department: "Paris",
        region: "Île-de-France",
        subjectStep1: "x",
        subjectStep2: "x",
        ...fields,
      });

  beforeAll(async () => {
    await dbConnect(__filename.slice(__dirname.length + 1, -3));
    await createYoungHelper(getNewYoungFixture({ email: YOUNG_EMAIL }));
  });
  afterAll(dbClose);

  it("should not reveal whether the email belongs to a young", async () => {
    const res = await form();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should answer identically for an unknown email", async () => {
    const res = await form({ email: "inconnu@example.org" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("should refuse attachments, which an anonymous visitor cannot have uploaded", async () => {
    const res = await form({ files: [{ name: "a.pdf", url: "https://evil.example/phishing", path: `message/${OTHER_ATTACHMENT_ID}` }] });
    expect(res.status).toBe(400);
    expect(calledPaths().includes("/v0/message")).toBe(false);
  });

  it("should cap the anonymous form per IP (M91)", async () => {
    for (let i = 0; i < 20; i++) expect((await form()).status).toBe(200);
    const res = await form();
    expect(res.status).toBe(429);
    expect(calledPaths().filter((path: string) => path === "/v0/message")).toHaveLength(20);
  });
});

describe("GET /SNUpport/s3file/:id (M39)", () => {
  it("should refuse an attachment that belongs to another user's ticket", async () => {
    const res = await request(getAppHelper(owner)).get(`/SNUpport/s3file/${OTHER_ATTACHMENT_ID}`);
    expect(res.status).toBe(403);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    expect(require("../utils").getFile).not.toHaveBeenCalled();
  });

  it("should serve an attachment from one of the user's tickets", async () => {
    const res = await request(getAppHelper(owner)).get(`/SNUpport/s3file/${OWN_ATTACHMENT_ID}`);
    expect(res.status).toBe(200);
  });
});

describe("POST /SNUpport/knowledgeBase/feedback (L22)", () => {
  const ARTICLE_ID = new Types.ObjectId().toString();
  const feedback = (body: Record<string, unknown>) => request(getAppHelper()).post("/SNUpport/knowledgeBase/feedback").send(body);

  it("should relay a well-formed feedback", async () => {
    const res = await feedback({ isPositive: false, knowledgeBaseArticle: ARTICLE_ID, comment: "pas clair" });
    expect(res.status).toBe(200);
    expect(JSON.parse(SNUpport.api.mock.calls[0][1].body)).toEqual({ isPositive: false, knowledgeBaseArticle: ARTICLE_ID, comment: "pas clair" });
  });

  it("should reject unexpected fields", async () => {
    const res = await feedback({ isPositive: true, knowledgeBaseArticle: ARTICLE_ID, createdBy: "x", treatedAt: "2026-01-01" });
    expect(res.status).toBe(400);
    expect(SNUpport.api).not.toHaveBeenCalled();
  });

  it("should reject a feedback without article", async () => {
    const res = await feedback({ isPositive: true });
    expect(res.status).toBe(400);
    expect(SNUpport.api).not.toHaveBeenCalled();
  });

  it("should take the contact email from the session only", async () => {
    mockOptionalAuthUser = owner;
    const res = await feedback({ isPositive: true, knowledgeBaseArticle: ARTICLE_ID, contactEmail: "victime@example.org" });
    expect(res.status).toBe(400);
    const ok = await feedback({ isPositive: true, knowledgeBaseArticle: ARTICLE_ID });
    expect(ok.status).toBe(200);
    expect(JSON.parse(SNUpport.api.mock.calls[0][1].body)).toEqual({ isPositive: true, knowledgeBaseArticle: ARTICLE_ID, contactEmail: owner.email });
  });
});
