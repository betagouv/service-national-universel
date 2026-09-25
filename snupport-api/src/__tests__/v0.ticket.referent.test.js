// M94 : les routes /v0/ticket renvoient à l'api v1 ce qui est retransmis tel quel au jeune.
// M93 : la synchro des référents ne supprime ni ne reprend jamais un autre compte support.
const express = require("express");
const request = require("supertest");

jest.mock("../middlewares/authenticationGuards", () => ({ apiKeyGuard: (_req, _res, next) => next() }));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../slack", () => ({ error: jest.fn() }));

const TICKET = {
  _id: "t1",
  number: 12,
  status: "OPEN",
  subject: "Question",
  contactId: "c1",
  contactEmail: "jeune@example.com",
  notes: [{ content: "note interne" }],
  messageDraft: "<p>brouillon</p>",
  agentEmail: "agent@support.fr",
  referentDepartmentEmail: "ref@snu.fr",
  copyRecipient: ["cc@example.com"],
  logVentilation: ["règle"],
};
const MESSAGE = {
  _id: "m1",
  ticketId: "t1",
  text: '<p>Bonjour</p><img src="x" onerror="alert(1)">',
  authorFirstName: "Agent",
  authorLastName: "Support",
  createdAt: new Date("2026-09-01"),
  fromEmail: "contact@mail-support.snu.gouv.fr",
  toEmail: "jeune@example.com",
  copyRecipient: ["cc@example.com"],
  slateContent: [{ type: "paragraph" }],
  files: [{ name: "a.pdf", path: "message/a.pdf", url: "https://bucket/a.pdf" }],
};

jest.mock("../models/ticket", () => ({ find: jest.fn(), findOne: jest.fn() }));
jest.mock("../models/contact", () => ({ findOne: jest.fn() }));
jest.mock("../models/message", () => ({ find: jest.fn() }));
jest.mock("../models/agent", () => ({ findOne: jest.fn(), create: jest.fn(), findOneAndDelete: jest.fn(), find: jest.fn(), deleteMany: jest.fn() }));
jest.mock("../models/organisation", () => ({ findOne: jest.fn().mockResolvedValue({ _id: "org" }) }));

const TicketModel = require("../models/ticket");
const ContactModel = require("../models/contact");
const MessageModel = require("../models/message");
const AgentModel = require("../models/agent");
const slack = require("../slack");

const app = express();
app.use(express.json());
app.use("/v0/ticket", require("../controllers/v0/ticket"));
app.use("/v0/referent", require("../controllers/v0/referent"));
app.use(require("../middlewares/validation").validationErrorHandler);

beforeEach(() => jest.clearAllMocks());

const INTERNAL_TICKET_FIELDS = ["notes", "messageDraft", "agentEmail", "referentDepartmentEmail", "copyRecipient", "logVentilation", "contactId"];

describe("GET /v0/ticket (M94)", () => {
  it("renvoie les tickets du contact sans les champs internes", async () => {
    ContactModel.findOne.mockResolvedValue({ _id: "c1" });
    TicketModel.find.mockResolvedValue([TICKET]);

    const res = await request(app).get("/v0/ticket").query({ email: "jeune@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toEqual(expect.objectContaining({ _id: "t1", number: 12, status: "OPEN", subject: "Question" }));
    for (const field of INTERNAL_TICKET_FIELDS) expect(res.body.data[0]).not.toHaveProperty(field);
  });
});

describe("GET /v0/ticket/withMessages (M94)", () => {
  it("renvoie le ticket et ses messages projetés, HTML assaini", async () => {
    TicketModel.findOne.mockResolvedValue(TICKET);
    MessageModel.find.mockResolvedValue([MESSAGE]);

    const res = await request(app).get("/v0/ticket/withMessages").query({ ticketId: "aaaaaaaaaaaaaaaaaaaaaaaa" });

    expect(res.status).toBe(200);
    for (const field of INTERNAL_TICKET_FIELDS) expect(res.body.data.ticket).not.toHaveProperty(field);
    const [message] = res.body.data.messages;
    expect(message).toEqual(expect.objectContaining({ _id: "m1", authorFirstName: "Agent", files: [{ name: "a.pdf", path: "message/a.pdf" }] }));
    for (const field of ["fromEmail", "toEmail", "copyRecipient", "slateContent"]) expect(message).not.toHaveProperty(field);
    expect(message.text).toContain("Bonjour");
    expect(message.text).not.toContain("onerror");
  });
});

const REFERENT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const referentPayload = (overrides = {}) => ({
  referents: [
    {
      id: REFERENT_ID,
      email: "support@snu.gouv.fr",
      firstName: "Réf",
      lastName: "Dép",
      departments: ["Paris"],
      region: "Île-de-France",
      role: "referent_department",
      ...overrides,
    },
  ],
});
const doc = (attrs) => ({ save: jest.fn().mockResolvedValue(undefined), ...attrs });

describe("POST /v0/referent (M93)", () => {
  it("ne supprime pas l'agent qui porte déjà le nouvel email d'un référent", async () => {
    const referentAgent = doc({ _id: "a-ref", email: "ancien@snu.fr", role: "REFERENT_DEPARTMENT", snuReferentId: REFERENT_ID });
    const supportAgent = doc({ _id: "a-support", email: "support@snu.gouv.fr", role: "AGENT" });
    AgentModel.findOne.mockImplementation(async (query) => (query.snuReferentId ? referentAgent : query.email === "support@snu.gouv.fr" ? supportAgent : null));

    const res = await request(app).post("/v0/referent").send(referentPayload());

    expect(res.status).toBe(200);
    expect(AgentModel.findOneAndDelete).not.toHaveBeenCalled();
    expect(referentAgent.save).not.toHaveBeenCalled();
    expect(referentAgent.email).toBe("ancien@snu.fr");
    expect(supportAgent.save).not.toHaveBeenCalled();
    expect(slack.error).toHaveBeenCalled();
  });

  it("ne transforme pas un agent du support en référent sur simple égalité d'email", async () => {
    const supportAgent = doc({ _id: "a-support", email: "support@snu.gouv.fr", role: "AGENT" });
    AgentModel.findOne.mockImplementation(async (query) => (query.email === "support@snu.gouv.fr" ? supportAgent : null));

    await request(app).post("/v0/referent").send(referentPayload());

    expect(supportAgent.role).toBe("AGENT");
    expect(supportAgent.save).not.toHaveBeenCalled();
    expect(AgentModel.create).not.toHaveBeenCalled();
  });

  it("met toujours à jour le compte du référent, y compris un changement d'email sans collision", async () => {
    const referentAgent = doc({ _id: "a-ref", email: "ancien@snu.fr", role: "REFERENT_DEPARTMENT", snuReferentId: REFERENT_ID });
    AgentModel.findOne.mockImplementation(async (query) => (query.snuReferentId ? referentAgent : null));

    await request(app)
      .post("/v0/referent")
      .send(referentPayload({ email: "nouveau@snu.fr" }));

    expect(referentAgent.email).toBe("nouveau@snu.fr");
    expect(referentAgent.save).toHaveBeenCalled();
    expect(slack.error).not.toHaveBeenCalled();
  });

  it("refuse de synchroniser un rôle d'agent du support", async () => {
    const res = await request(app)
      .post("/v0/referent")
      .send(referentPayload({ role: "dg" }));

    expect(res.status).toBe(400);
    expect(AgentModel.create).not.toHaveBeenCalled();
  });

  it("DELETE ne supprime qu'un compte référent", async () => {
    AgentModel.findOne.mockResolvedValue(null);

    const res = await request(app).delete("/v0/referent").send({ email: "support@snu.gouv.fr" });

    expect(res.status).toBe(404);
    expect(AgentModel.findOne).toHaveBeenCalledWith({ email: "support@snu.gouv.fr", role: { $in: ["REFERENT_DEPARTMENT", "REFERENT_REGION"] } });
  });
});

describe("POST /v0/referent/reconcile (GOO-13)", () => {
  const ACTIVE_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
  const FORMER_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
  const mockFind = (agents) => AgentModel.find.mockReturnValue({ select: () => ({ lean: jest.fn().mockResolvedValue(agents) }) });

  it("supprime les comptes des référents qui ne sont plus habilités", async () => {
    mockFind([{ _id: "a-former", snuReferentId: FORMER_ID }]);

    const res = await request(app).post("/v0/referent/reconcile").send({ activeReferentIds: [ACTIVE_ID] });

    expect(res.status).toBe(200);
    expect(res.body.data.revokedReferentIds).toEqual([FORMER_ID]);
    expect(AgentModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: ["a-former"] } });
  });

  it("ne cible que les comptes référents rattachés à un référent SNU absent de la liste", async () => {
    mockFind([]);

    await request(app).post("/v0/referent/reconcile").send({ activeReferentIds: [ACTIVE_ID] });

    expect(AgentModel.find).toHaveBeenCalledWith({
      role: { $in: ["REFERENT_DEPARTMENT", "REFERENT_REGION"] },
      snuReferentId: { $exists: true, $nin: [null, "", ACTIVE_ID] },
    });
    expect(AgentModel.deleteMany).not.toHaveBeenCalled();
  });

  it("refuse une liste vide, qui révoquerait tous les référents", async () => {
    const res = await request(app).post("/v0/referent/reconcile").send({ activeReferentIds: [] });

    expect(res.status).toBe(400);
    expect(AgentModel.find).not.toHaveBeenCalled();
  });

  it("refuse un identifiant mal formé", async () => {
    const res = await request(app).post("/v0/referent/reconcile").send({ activeReferentIds: [{ $ne: null }] });

    expect(res.status).toBe(400);
    expect(AgentModel.find).not.toHaveBeenCalled();
  });
});
