// Regression tests for H83: POST /macro/:id applied a macro to any ticket id supplied in
// the body, without the perimeter check (canAccessTicket) already enforced in ticket.ts
// and message.js. A departmental referent could therefore mutate tickets outside their
// department and trigger an email to the ticket's contact from the official support sender.
const express = require("express");
const request = require("supertest");

const ATTACKER_AGENT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const MACRO_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const SHORTCUT_ID = "cccccccccccccccccccccccc";
const FOREIGN_TICKET_ID = "dddddddddddddddddddddddd";
const OWN_TICKET_ID = "eeeeeeeeeeeeeeeeeeeeeeee";
const UNKNOWN_TICKET_ID = "ffffffffffffffffffffffff";

let mockCurrentUser;

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
  apiKeyGuard: (_req, _res, next) => next(),
}));

jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../utils", () => ({
  sendEmailWithConditions: jest.fn().mockResolvedValue(undefined),
  getHoursDifference: () => 1,
}));

jest.mock("../models/ticket", () => ({ findById: jest.fn() }));
jest.mock("../models/macro", () => ({ findById: jest.fn() }));
jest.mock("../models/agent", () => ({ findById: jest.fn() }));
jest.mock("../models/shortcut", () => ({ findOne: jest.fn() }));
jest.mock("../models/tag", () => ({ findById: jest.fn() }));
jest.mock("../models/folder", () => ({ findById: jest.fn() }));
jest.mock("../models/message", () => ({
  find: jest.fn(() => ({ countDocuments: jest.fn().mockResolvedValue(3) })),
  create: jest.fn().mockResolvedValue({ _id: "111111111111111111111111" }),
}));

const TicketModel = require("../models/ticket");
const MacroModel = require("../models/macro");
const AgentModel = require("../models/agent");
const ShortcutModel = require("../models/shortcut");
const { sendEmailWithConditions } = require("../utils");
const macroRouter = require("../controllers/macro");

const buildTicket = (attrs) => {
  const ticket = {
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    canal: "MAIL",
    status: "OPEN",
    textMessage: [],
    notes: [],
    tags: [],
    tagsId: [],
    save: jest.fn().mockResolvedValue(undefined),
    ...attrs,
  };
  ticket.set = jest.fn((values) => Object.assign(ticket, values));
  return ticket;
};

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/macro", macroRouter);
  return app;
};

describe("POST /macro/:id perimeter enforcement", () => {
  let foreignTicket;
  let ownTicket;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCurrentUser = { _id: ATTACKER_AGENT_ID, role: "REFERENT_DEPARTMENT", departments: ["Paris"], firstName: "Ref", lastName: "Paris" };

    foreignTicket = buildTicket({ _id: FOREIGN_TICKET_ID, contactDepartment: "Rhône", contactRegion: "Auvergne-Rhône-Alpes", formSubjectStep1: "QUESTION", contactEmail: "usager@example.com" });
    ownTicket = buildTicket({ _id: OWN_TICKET_ID, contactDepartment: "Paris", contactRegion: "Ile-de-France", formSubjectStep1: "QUESTION", contactEmail: "usager-paris@example.com" });

    TicketModel.findById.mockImplementation(async (id) => {
      if (id === FOREIGN_TICKET_ID) return foreignTicket;
      if (id === OWN_TICKET_ID) return ownTicket;
      return null;
    });

    AgentModel.findById.mockResolvedValue({ _id: ATTACKER_AGENT_ID, firstName: "Ref", lastName: "Paris" });

    // Macro and shortcut are both attacker-controlled (POST /macro, POST /shortcut).
    MacroModel.findById.mockResolvedValue({
      _id: MACRO_ID,
      macroAction: [{ action: "ADDMESSAGE", field: "message", value: SHORTCUT_ID }],
    });
    ShortcutModel.findOne.mockResolvedValue({ _id: SHORTCUT_ID, text: "Texte de phishing", content: [] });
  });

  it("rejects a macro applied to a ticket outside the referent's department", async () => {
    const res = await request(buildApp())
      .post(`/macro/${MACRO_ID}`)
      .send({ ticketsId: [FOREIGN_TICKET_ID], agentId: ATTACKER_AGENT_ID });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, code: "OPERATION_UNAUTHORIZED" });
  });

  it("does not modify a ticket outside the referent's department", async () => {
    await request(buildApp())
      .post(`/macro/${MACRO_ID}`)
      .send({ ticketsId: [FOREIGN_TICKET_ID], agentId: ATTACKER_AGENT_ID });

    expect(foreignTicket.save).not.toHaveBeenCalled();
  });

  it("does not email the contact of a ticket outside the referent's department", async () => {
    await request(buildApp())
      .post(`/macro/${MACRO_ID}`)
      .send({ ticketsId: [FOREIGN_TICKET_ID], agentId: ATTACKER_AGENT_ID });

    expect(sendEmailWithConditions).not.toHaveBeenCalled();
  });

  it("leaves an in-perimeter ticket untouched when another ticket in the same batch is out of perimeter", async () => {
    await request(buildApp())
      .post(`/macro/${MACRO_ID}`)
      .send({ ticketsId: [OWN_TICKET_ID, FOREIGN_TICKET_ID], agentId: ATTACKER_AGENT_ID });

    expect(ownTicket.save).not.toHaveBeenCalled();
  });

  // GOO-13 : appliquer une macro est réservé au rôle AGENT, même sur un ticket du périmètre du référent.
  it("refuses a macro to a referent even on a ticket inside their department", async () => {
    const res = await request(buildApp())
      .post(`/macro/${MACRO_ID}`)
      .send({ ticketsId: [OWN_TICKET_ID], agentId: ATTACKER_AGENT_ID });

    expect(res.status).toBe(403);
    expect(ownTicket.save).not.toHaveBeenCalled();
  });

  it("still applies a macro to any ticket for a central AGENT", async () => {
    mockCurrentUser = { _id: ATTACKER_AGENT_ID, role: "AGENT", firstName: "Central", lastName: "Agent" };

    const res = await request(buildApp())
      .post(`/macro/${MACRO_ID}`)
      .send({ ticketsId: [FOREIGN_TICKET_ID], agentId: ATTACKER_AGENT_ID });

    expect(res.status).toBe(200);
    expect(foreignTicket.save).toHaveBeenCalled();
  });

  it("answers 404 instead of crashing when a ticket id does not exist", async () => {
    mockCurrentUser = { _id: ATTACKER_AGENT_ID, role: "AGENT", firstName: "Central", lastName: "Agent" };

    const res = await request(buildApp())
      .post(`/macro/${MACRO_ID}`)
      .send({ ticketsId: [UNKNOWN_TICKET_ID], agentId: ATTACKER_AGENT_ID });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ ok: false, code: "NOT_FOUND" });
  });
});
