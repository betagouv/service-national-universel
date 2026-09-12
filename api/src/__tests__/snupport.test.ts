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
    return { ok: false };
  });
};

beforeEach(() => {
  resetAppAuth();
  jest.clearAllMocks();
  mockSNUpport();
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
