// M91 / M92 / M94 : POST /v0/message est atteint anonymement via le formulaire public de l'api v1
// (POST /SNUpport/ticket/form, source FORM). L'email n'y est pas authentifié.
const express = require("express");
const request = require("supertest");

const ORGANISATION = {
  _id: "org",
  attributes: [
    { name: "departement", format: "text" },
    { name: "region", format: "text" },
    { name: "role", format: "text" },
    { name: "page précédente", format: "text" },
  ],
};

jest.mock("../middlewares/authenticationGuards", () => ({
  apiKeyGuard: (req, _res, next) => {
    req.user = ORGANISATION;
    next();
  },
}));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../brevo", () => ({ sendTemplate: jest.fn() }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: async (t) => t }));
jest.mock("../utils/email", () => ({ weekendRanges: [], isDateInRange: () => false }));
jest.mock("../utils", () => ({
  weekday: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  sendNotif: jest.fn(),
  SENDINBLUE_TEMPLATES: { MESSAGE_RECEIVED: "1255", SNUPPORT_CLOSED: "2416" },
}));

const mockTicketDoc = (attrs) => ({
  status: "NEW",
  messageCount: 1,
  textMessage: [],
  notes: [{ content: "note interne" }],
  messageDraft: "brouillon agent",
  agentEmail: "agent@support.fr",
  logVentilation: ["règle 1"],
  save: jest.fn().mockResolvedValue(undefined),
  ...attrs,
});

jest.mock("../models/ticket", () => ({
  findById: jest.fn(),
  create: jest.fn(),
  find: jest.fn(() => ({ sort: () => ({ collation: () => ({ limit: async () => [{ number: "41" }] }) }) })),
}));
jest.mock("../models/contact", () => ({ findOne: jest.fn(), findOneAndUpdate: jest.fn(), create: jest.fn() }));
jest.mock("../models/agent", () => ({ findOne: jest.fn().mockResolvedValue(null) }));
jest.mock("../models/message", () => ({ create: jest.fn(async (obj) => ({ _id: "m1", createdAt: new Date(), fromEmail: "x@y.fr", rawText: "brut", ...obj })) }));

const TicketModel = require("../models/ticket");
const ContactModel = require("../models/contact");
const MessageModel = require("../models/message");
const { sendNotif } = require("../utils");
const router = require("../controllers/v0/message");

const app = express();
app.use(express.json());
app.use("/v0/message", router);

const EXISTING = { _id: "c-victime", email: "victime@example.com", firstName: "Alice", lastName: "Martin" };

const formBody = (overrides = {}) => ({
  message: "Bonjour",
  email: "victime@example.com",
  subject: "Technique - inscription",
  firstName: "Pirate",
  lastName: "Pirate",
  source: "FORM",
  attributes: [
    { name: "departement", value: "Paris" },
    { name: "region", value: "Île-de-France" },
    { name: "role", value: "unknown" },
    { name: "page précédente", value: null },
  ],
  formSubjectStep1: "TECHNICAL",
  formSubjectStep2: "OTHER",
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  TicketModel.create.mockImplementation(async (obj) => mockTicketDoc({ _id: "t-new", ...obj }));
  ContactModel.create.mockImplementation(async (obj) => ({ _id: "c-new", ...obj }));
});

describe("POST /v0/message — formulaire public (M91)", () => {
  it("ne réécrit pas la fiche d'un contact existant", async () => {
    ContactModel.findOne.mockResolvedValue(EXISTING);

    const res = await request(app).post("/v0/message").send(formBody());

    expect(res.status).toBe(200);
    expect(ContactModel.findOneAndUpdate).not.toHaveBeenCalled();
    expect(ContactModel.create).not.toHaveBeenCalled();
  });

  it("refuse de rattacher un message anonyme à un ticket existant", async () => {
    const res = await request(app)
      .post("/v0/message")
      .send(formBody({ ticketId: "aaaaaaaaaaaaaaaaaaaaaaaa" }));

    expect(res.status).toBe(403);
    expect(MessageModel.create).not.toHaveBeenCalled();
  });

  it("ne conserve des pièces jointes que le nom et le chemin", async () => {
    ContactModel.findOne.mockResolvedValue(EXISTING);

    await request(app)
      .post("/v0/message")
      .send(formBody({ files: [{ name: "a.pdf", url: "javascript:alert(1)", path: "message/abc.pdf" }] }));

    expect(MessageModel.create.mock.calls[0][0].files).toEqual([{ name: "a.pdf", path: "message/abc.pdf" }]);
  });
});

describe("POST /v0/message — routes authentifiées", () => {
  it("met à jour la fiche du contact de la session", async () => {
    ContactModel.findOneAndUpdate.mockResolvedValue(EXISTING);

    const res = await request(app)
      .post("/v0/message")
      .send(formBody({ source: "PLATFORM", email: "victime@example.com" }));

    expect(res.status).toBe(200);
    expect(ContactModel.findOneAndUpdate).toHaveBeenCalled();
  });

  it("refuse un message sur le ticket d'un autre contact", async () => {
    ContactModel.findOneAndUpdate.mockResolvedValue(EXISTING);
    TicketModel.findById.mockResolvedValue(mockTicketDoc({ _id: "t-autre", contactId: "c-autre" }));

    const { source, ...body } = formBody();
    const res = await request(app)
      .post("/v0/message")
      .send({ ...body, ticketId: "bbbbbbbbbbbbbbbbbbbbbbbb" });

    expect(res.status).toBe(403);
    expect(MessageModel.create).not.toHaveBeenCalled();
  });

  it("accepte un message sur son propre ticket", async () => {
    ContactModel.findOneAndUpdate.mockResolvedValue(EXISTING);
    TicketModel.findById.mockResolvedValue(mockTicketDoc({ _id: "t-alice", contactId: "c-victime" }));

    const { source, ...body } = formBody();
    const res = await request(app)
      .post("/v0/message")
      .send({ ...body, ticketId: "bbbbbbbbbbbbbbbbbbbbbbbb" });

    expect(res.status).toBe(200);
    expect(MessageModel.create).toHaveBeenCalled();
  });
});

describe("POST /v0/message — contenu (M92) et réponse (M94)", () => {
  it("échappe le HTML saisi, dans le message stocké comme dans l'email d'accusé de réception", async () => {
    ContactModel.findOne.mockResolvedValue(null);

    await request(app)
      .post("/v0/message")
      .send(formBody({ message: '<script>alert(1)</script><img src=x onerror="alert(1)">' }));

    const stored = MessageModel.create.mock.calls[0][0].text;
    expect(stored).not.toMatch(/<script|<img/);
    expect(stored).toContain("&lt;script&gt;");
    expect(sendNotif.mock.calls[0][0].message).not.toMatch(/<script|<img/);
  });

  it("ne renvoie ni notes internes, ni brouillon, ni email d'agent", async () => {
    ContactModel.findOne.mockResolvedValue(EXISTING);

    const res = await request(app).post("/v0/message").send(formBody());

    expect(res.body.data.ticket).toEqual(expect.objectContaining({ _id: "t-new", number: 42, status: "NEW", contactEmail: "victime@example.com" }));
    for (const field of ["notes", "messageDraft", "agentEmail", "logVentilation", "contactAttributes"]) expect(res.body.data.ticket).not.toHaveProperty(field);
    expect(res.body.data.message).not.toHaveProperty("fromEmail");
    expect(res.body.data.message).not.toHaveProperty("rawText");
  });
});
