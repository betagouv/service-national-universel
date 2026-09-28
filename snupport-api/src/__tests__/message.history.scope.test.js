// PH25 : messageHistory (l'id d'un message précis à joindre à la réponse, en plus du dernier
// message) n'était jamais vérifié comme appartenant au ticket. Un agent pouvait donc faire citer,
// dans l'email de réponse envoyé au contact d'UN ticket, le contenu d'un message d'un AUTRE ticket
// (hors de son périmètre), simplement en passant son id.
const express = require("express");
const request = require("supertest");

const AGENT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const TICKET_ID = "dddddddddddddddddddddddd";
const OTHER_TICKET_MESSAGE_ID = "eeeeeeeeeeeeeeeeeeeeeeee";
const OWN_TICKET_MESSAGE_ID = "ffffffffffffffffffffffff";

const VICTIM = "victime@example.com";

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = { _id: AGENT_ID, role: "AGENT", firstName: "Agent", lastName: "Support", email: "agent@example.com" };
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
  sendResponseTicket: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../models/ticket", () => ({ findById: jest.fn() }));
jest.mock("../models/agent", () => ({ findOne: jest.fn() }));
jest.mock("../models/message", () => ({
  find: jest.fn(() => ({ countDocuments: jest.fn().mockResolvedValue(3) })),
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn().mockResolvedValue({ _id: "111111111111111111111111", copyRecipient: [], files: [], save: jest.fn().mockResolvedValue(undefined) }),
}));

const TicketModel = require("../models/ticket");
const MessageModel = require("../models/message");
const { sendResponseTicket } = require("../utils");
const messageRouter = require("../controllers/message");

const app = express();
app.use(express.json());
app.use("/message", messageRouter);

const buildTicket = () => ({
  _id: TICKET_ID,
  canal: "MAIL",
  status: "OPEN",
  messageCount: 3,
  textMessage: [],
  contactEmail: VICTIM,
  copyRecipient: [],
  save: jest.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  jest.clearAllMocks();
  TicketModel.findById.mockResolvedValue(buildTicket());
  // Par défaut, aucun message ne correspond (id d'un autre ticket) : le scope doit refuser.
  MessageModel.findOne.mockResolvedValue(null);
});

const post = (messageHistory) => request(app).post("/message").send({ message: "bonjour", ticketId: TICKET_ID, dest: VICTIM, messageHistory });

describe("POST /message — périmètre de messageHistory (PH25)", () => {
  it("refuse un messageHistory qui appartient à un autre ticket", async () => {
    MessageModel.findOne.mockResolvedValue(null); // aucun message {_id: OTHER_TICKET_MESSAGE_ID, ticketId: TICKET_ID}

    const res = await post(OTHER_TICKET_MESSAGE_ID);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, code: "OPERATION_NOT_ALLOWED" });
    expect(sendResponseTicket).not.toHaveBeenCalled();
  });

  it("vérifie explicitement que le message appartient au ticket courant", async () => {
    MessageModel.findOne.mockResolvedValue({ _id: OWN_TICKET_MESSAGE_ID, ticketId: TICKET_ID });

    await post(OWN_TICKET_MESSAGE_ID);

    expect(MessageModel.findOne).toHaveBeenCalledWith({ _id: OWN_TICKET_MESSAGE_ID, ticketId: TICKET_ID });
  });

  it("accepte un messageHistory qui appartient bien au ticket", async () => {
    MessageModel.findOne.mockResolvedValue({ _id: OWN_TICKET_MESSAGE_ID, ticketId: TICKET_ID });

    const res = await post(OWN_TICKET_MESSAGE_ID);

    expect(res.status).toBe(200);
    expect(sendResponseTicket).toHaveBeenCalledTimes(1);
  });

  it("laisse passer messageHistory=\"all\" et messageHistory absent sans contrôle de scope", async () => {
    const resAll = await post("all");
    expect(resAll.status).toBe(200);

    const resNone = await post(undefined);
    expect(resNone.status).toBe(200);

    expect(MessageModel.findOne).not.toHaveBeenCalled();
  });
});

describe("POST /message/sendEmailFile/:id — périmètre de messageHistory (PH25)", () => {
  const postWithFile = (messageHistory) =>
    request(app)
      .post(`/message/sendEmailFile/${TICKET_ID}`)
      .field("body", JSON.stringify({ message: "bonjour", dest: VICTIM, messageHistory }));

  it("refuse un messageHistory qui appartient à un autre ticket", async () => {
    MessageModel.findOne.mockResolvedValue(null);

    const res = await postWithFile(OTHER_TICKET_MESSAGE_ID);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, code: "OPERATION_NOT_ALLOWED" });
    expect(sendResponseTicket).not.toHaveBeenCalled();
  });

  it("accepte un messageHistory qui appartient bien au ticket", async () => {
    MessageModel.findOne.mockResolvedValue({ _id: OWN_TICKET_MESSAGE_ID, ticketId: TICKET_ID });

    const res = await postWithFile(OWN_TICKET_MESSAGE_ID);

    expect(res.status).toBe(200);
    expect(sendResponseTicket).toHaveBeenCalledTimes(1);
  });
});
