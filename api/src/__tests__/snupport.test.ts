import request from "supertest";
import { Types } from "mongoose";

import getAppHelper, { resetAppAuth } from "./helpers/app";
import { getNewReferentFixture } from "./fixtures/referent";

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

const mockSNUpport = () => {
  SNUpport.api.mockImplementation(async (path: string) => {
    if (path.startsWith("/v0/ticket?email=")) return ownTicketsResponse;
    if (path.startsWith("/v0/ticket/withMessages")) return { ok: true, data: { ticket: { _id: path.split("ticketId=")[1] }, messages: [] } };
    if (path === "/v0/message") return { ok: true, data: { ticket: { _id: OWN_TICKET_ID }, message: {} } };
    if (path.startsWith("/knowledge-base/")) return { ok: true, data: [] };
    return { ok: false };
  });
};

beforeEach(() => {
  resetAppAuth();
  jest.clearAllMocks();
  mockSNUpport();
  mockOptionalAuthUser = null;
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
