// PM49 : la pièce jointe qu'un agent ajoute à une réponse (POST /message/sendEmailFile/:id) part
// telle quelle vers un contact externe ; elle doit passer le même scan antivirus que les pièces
// jointes IMAP entrantes avant d'être envoyée et stockée.
const express = require("express");
const request = require("supertest");

const AGENT_ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const TICKET_ID = "dddddddddddddddddddddddd";
const VICTIM = "victime@example.com";

const mockScanBuffer = jest.fn();

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
jest.mock("../utils/virusScanner", () => ({ initVirusScanner: jest.fn(), scanBuffer: (...args) => mockScanBuffer(...args) }));
jest.mock("../utils", () => ({
  getFile: jest.fn(),
  deleteFile: jest.fn(),
  uploadAttachment: jest.fn().mockResolvedValue("https://cellar/message/piece.pdf"),
  getSignedUrl: jest.fn(),
  getHoursDifference: () => 1,
  sendResponseTicket: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../models/ticket", () => ({ findById: jest.fn() }));
jest.mock("../models/agent", () => ({ find: jest.fn().mockResolvedValue([]) }));
jest.mock("../models/message", () => ({
  findOne: jest.fn(),
  create: jest.fn().mockResolvedValue({ _id: "111111111111111111111111", files: [], save: jest.fn().mockResolvedValue(undefined) }),
}));

const TicketModel = require("../models/ticket");
const { uploadAttachment, sendResponseTicket } = require("../utils");
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
  mockScanBuffer.mockReset();
  uploadAttachment.mockResolvedValue("https://cellar/message/piece.pdf");
});

// Signature PDF minimale : suffit à ce que file-type (inspectAttachment) détecte application/pdf.
const PDF_SIGNATURE = Buffer.from("%PDF-1.4\n%âãÏÓ\n");

const post = () =>
  request(app)
    .post(`/message/sendEmailFile/${TICKET_ID}`)
    .field("body", JSON.stringify({ message: "bonjour", messageHistory: "all" }))
    .attach("file", PDF_SIGNATURE, "cni.pdf");

describe("POST /message/sendEmailFile — scan antivirus des pièces jointes (PM49)", () => {
  it("envoie la réponse quand la pièce jointe n'est pas infectée", async () => {
    mockScanBuffer.mockResolvedValue({ infected: false });

    const res = await post();

    expect(res.status).toBe(200);
    expect(mockScanBuffer).toHaveBeenCalledTimes(1);
    expect(sendResponseTicket).toHaveBeenCalledTimes(1);
    expect(uploadAttachment).toHaveBeenCalledTimes(1);
  });

  it("refuse l'envoi et n'uploade rien quand la pièce jointe est infectée", async () => {
    mockScanBuffer.mockResolvedValue({ infected: true });

    const res = await post();

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ ok: false, code: "FILE_INFECTED" });
    expect(sendResponseTicket).not.toHaveBeenCalled();
    expect(uploadAttachment).not.toHaveBeenCalled();
  });
});
