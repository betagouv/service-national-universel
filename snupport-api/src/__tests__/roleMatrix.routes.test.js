// GOO-13 / FH11 : la matrice de rôles du support (macros, modules de texte, suppression et transfert de
// ticket réservés au rôle AGENT ; DG en lecture seule) n'existait que dans snupport-app. Un référent ou
// un DG pouvait appeler directement les routes.
const express = require("express");
const request = require("supertest");

const MACRO_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const TICKET_ID = "bbbbbbbbbbbbbbbbbbbbbbbb";
const AGENT_ID = "cccccccccccccccccccccccc";

let mockCurrentUser;

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = mockCurrentUser;
    next();
  },
  apiKeyGuard: (_req, _res, next) => next(),
}));

jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../utils/crypto", () => ({ encrypt: (b) => b, decrypt: (b) => b }));
jest.mock("../utils/file", () => ({ getS3Path: (n) => `message/${n}`, getAttachmentFileName: (n) => n }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: async (t) => t }));
jest.mock("../utils", () => ({
  getFile: jest.fn(),
  deleteFile: jest.fn(),
  uploadAttachment: jest.fn(),
  getSignedUrl: jest.fn(),
  getHoursDifference: () => 1,
  sendResponseTicket: jest.fn(),
  sendEmailWithConditions: jest.fn(),
  sendNotif: jest.fn(),
  weekday: [],
  SENDINBLUE_TEMPLATES: {},
  diacriticSensitiveRegex: (s) => s,
}));

jest.mock("../models/macro", () => ({
  create: jest.fn().mockResolvedValue(undefined),
  findById: jest.fn(),
  deleteOne: jest.fn().mockResolvedValue(undefined),
  find: jest.fn().mockResolvedValue([]),
}));
jest.mock("../models/ticket", () => ({
  findById: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn().mockResolvedValue(undefined),
  create: jest.fn(),
}));
jest.mock("../models/agent", () => ({ findById: jest.fn(), findOne: jest.fn(), find: jest.fn() }));
jest.mock("../models/contact", () => ({ findOne: jest.fn(), create: jest.fn() }));
jest.mock("../models/message", () => ({ find: jest.fn(), findOne: jest.fn(), findById: jest.fn(), create: jest.fn() }));
jest.mock("../models/tag", () => ({ find: jest.fn(), findById: jest.fn() }));
jest.mock("../models/folder", () => ({ findById: jest.fn() }));
jest.mock("../models/shortcut", () => ({ find: jest.fn(), findOne: jest.fn() }));

const MacroModel = require("../models/macro");
const TicketModel = require("../models/ticket");
const MessageModel = require("../models/message");
const ContactModel = require("../models/contact");
const { validationErrorHandler } = require("../middlewares/validation");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/macro", require("../controllers/macro"));
  app.use("/ticket", require("../controllers/ticket"));
  app.use("/message", require("../controllers/message"));
  app.use("/contact", require("../controllers/contact"));
  app.use(validationErrorHandler);
  return app;
};

const AGENT = { _id: AGENT_ID, role: "AGENT", firstName: "Agent", lastName: "Support", email: "agent@example.com" };
const REFERENT = { _id: "dddddddddddddddddddddddd", role: "REFERENT_DEPARTMENT", departments: ["Rhône"], firstName: "Réf", lastName: "Dép", email: "ref@example.com" };
const DG = { _id: "eeeeeeeeeeeeeeeeeeeeeeee", role: "DG", firstName: "D", lastName: "G", email: "dg@example.com" };

// Un ticket du périmètre du référent : le refus doit venir du rôle, pas du périmètre.
const buildTicket = () => ({ _id: TICKET_ID, contactDepartment: "Rhône", formSubjectStep1: "QUESTION", status: "OPEN", notes: [], save: jest.fn() });

const MACRO_BODY = { name: "m", description: "d", isActive: true, macroAction: [{ action: "SET", field: "status", value: "CLOSED" }] };

let app;
beforeAll(() => {
  app = buildApp();
});

beforeEach(() => {
  jest.clearAllMocks();
  TicketModel.findById.mockResolvedValue(buildTicket());
  TicketModel.findOne.mockResolvedValue(buildTicket());
});

describe("macros réservées au rôle AGENT", () => {
  it.each([REFERENT, DG])("refuse la création à $role", async (user) => {
    mockCurrentUser = user;
    const res = await request(app).post("/macro").send(MACRO_BODY);
    expect(res.status).toBe(403);
    expect(MacroModel.create).not.toHaveBeenCalled();
  });

  it("refuse la modification et la suppression à un référent", async () => {
    mockCurrentUser = REFERENT;
    expect((await request(app).patch(`/macro/${MACRO_ID}`).send({ name: "x" })).status).toBe(403);
    expect((await request(app).delete(`/macro/${MACRO_ID}`)).status).toBe(403);
    expect(MacroModel.findById).not.toHaveBeenCalled();
    expect(MacroModel.deleteOne).not.toHaveBeenCalled();
  });

  it("refuse l'application d'une macro à un référent, même sur un ticket de son périmètre", async () => {
    mockCurrentUser = REFERENT;
    const res = await request(app).post(`/macro/${MACRO_ID}`).send({ ticketsId: [TICKET_ID], agentId: REFERENT._id });
    expect(res.status).toBe(403);
    expect(TicketModel.findById).not.toHaveBeenCalled();
  });

  it("laisse un agent créer une macro", async () => {
    mockCurrentUser = AGENT;
    const res = await request(app).post("/macro").send(MACRO_BODY);
    expect(res.status).toBe(200);
    expect(MacroModel.create).toHaveBeenCalled();
  });

  it("laisse la lecture ouverte aux référents", async () => {
    mockCurrentUser = REFERENT;
    expect((await request(app).get("/macro")).status).toBe(200);
  });
});

describe("suppression et transfert de ticket réservés au rôle AGENT", () => {
  it.each([REFERENT, DG])("refuse la suppression à $role", async (user) => {
    mockCurrentUser = user;
    const res = await request(app).delete(`/ticket/${TICKET_ID}`);
    expect(res.status).toBe(403);
    expect(TicketModel.findOneAndDelete).not.toHaveBeenCalled();
  });

  it.each([REFERENT, DG])("refuse le transfert à $role", async (user) => {
    mockCurrentUser = user;
    const res = await request(app).put(`/ticket/transfer/${TICKET_ID}`).send({ contactEmail: "tiers@example.com" });
    expect(res.status).toBe(403);
    expect(TicketModel.findById).not.toHaveBeenCalled();
  });

  it("laisse un agent supprimer un ticket", async () => {
    mockCurrentUser = AGENT;
    const res = await request(app).delete(`/ticket/${TICKET_ID}`);
    expect(res.status).toBe(200);
    expect(TicketModel.findOneAndDelete).toHaveBeenCalledWith({ _id: TICKET_ID });
  });
});

describe("DG en lecture seule", () => {
  beforeEach(() => {
    mockCurrentUser = DG;
  });

  it("refuse la modification d'un ticket", async () => {
    const res = await request(app).patch(`/ticket/${TICKET_ID}`).send({ status: "CLOSED" });
    expect(res.status).toBe(403);
    expect(TicketModel.findOne).not.toHaveBeenCalled();
  });

  it("refuse la création d'un ticket", async () => {
    const res = await request(app)
      .post("/ticket")
      .send({ subject: "s", contactEmail: "jeune@example.com", canal: "MAIL", message: "m", tags: [], copyRecipients: [], files: [] });
    expect(res.status).toBe(403);
    expect(TicketModel.create).not.toHaveBeenCalled();
  });

  it("refuse l'envoi d'un message", async () => {
    const res = await request(app).post("/message").send({ message: "bonjour", ticketId: TICKET_ID });
    expect(res.status).toBe(403);
    expect(MessageModel.create).not.toHaveBeenCalled();
  });

  it("refuse l'envoi d'un message avec pièces jointes", async () => {
    const res = await request(app).post(`/message/sendEmailFile/${TICKET_ID}`).send({ body: "{}" });
    expect(res.status).toBe(403);
    expect(TicketModel.findById).not.toHaveBeenCalled();
  });

  it("refuse la suppression d'une pièce jointe", async () => {
    const res = await request(app).delete(`/message/s3file/${TICKET_ID}`).send({ path: "message/x.pdf" });
    expect(res.status).toBe(403);
    expect(MessageModel.findById).not.toHaveBeenCalled();
  });

  it("refuse la création d'un contact", async () => {
    const res = await request(app).post("/contact").send({ email: "jeune@example.com", firstName: "J", lastName: "E" });
    expect(res.status).toBe(403);
    expect(ContactModel.findOne).not.toHaveBeenCalled();
  });
});
