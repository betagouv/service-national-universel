// H86, défense en profondeur : POST /message acceptait n'importe quel `dest`, et
// sendEmailWithConditions y envoie tout l'historique du ticket plus ses pièces jointes
// déchiffrées quand messageHistory vaut "all". Le destinataire doit appartenir au fil.
const express = require("express");
const request = require("supertest");

const AGENT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const TICKET_ID = "dddddddddddddddddddddddd";

const VICTIM = "victime@example.com";
const CC = "parent@example.com";
// TLD réel : Joi.string().email() valide les TLD sur la liste IANA, un « .tld » inventé
// serait rejeté par la validation avant d'atteindre le contrôle de périmètre.
const ATTACKER = "attaquant@evil.com";

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
  create: jest.fn().mockResolvedValue({ _id: "111111111111111111111111", copyRecipient: [] }),
}));

const TicketModel = require("../models/ticket");
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
  copyRecipient: [CC],
  save: jest.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  jest.clearAllMocks();
  TicketModel.findById.mockResolvedValue(buildTicket());
});

const post = (dest) => request(app).post("/message").send({ message: "bonjour", ticketId: TICKET_ID, dest, messageHistory: "all" });

describe("POST /message — périmètre du destinataire", () => {
  it("refuse un destinataire étranger au fil et n'envoie rien", async () => {
    const res = await post(ATTACKER);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, code: "OPERATION_NOT_ALLOWED" });
    expect(sendResponseTicket).not.toHaveBeenCalled();
  });

  it("accepte le contact du ticket", async () => {
    const res = await post(VICTIM);

    expect(res.status).toBe(200);
    expect(sendResponseTicket).toHaveBeenCalledTimes(1);
    expect(sendResponseTicket.mock.calls[0][0]).toMatchObject({ dest: VICTIM });
  });

  it("accepte une adresse déjà en copie du ticket", async () => {
    const res = await post(CC);

    expect(res.status).toBe(200);
    expect(sendResponseTicket).toHaveBeenCalledTimes(1);
  });

  it("refuse une adresse qui se contente d'englober celle du contact", async () => {
    const res = await post(`${VICTIM}.evil.com`);

    expect(res.status).toBe(403);
    expect(sendResponseTicket).not.toHaveBeenCalled();
  });
});
