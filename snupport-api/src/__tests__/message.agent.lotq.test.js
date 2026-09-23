// Routes agent de /message : M87 (suppression d'un objet S3 hors du message), M88 (copies et HTML
// des réponses), L50 (pièces jointes de sendEmailFile).
const express = require("express");
const request = require("supertest");

const TICKET_ID = "dddddddddddddddddddddddd";
const MESSAGE_ID = "eeeeeeeeeeeeeeeeeeeeeeee";
const PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF");

jest.mock("../middlewares/authenticationGuards", () => ({
  agentGuard: (req, _res, next) => {
    req.user = { _id: "aaaaaaaaaaaaaaaaaaaaaaaa", role: "AGENT", firstName: "Agent", lastName: "Support", email: "agent@example.com" };
    next();
  },
}));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../utils/crypto", () => ({ encrypt: (b) => b, decrypt: (b) => b }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: async (t) => t }));
jest.mock("../utils", () => ({
  getFile: jest.fn(),
  deleteFile: jest.fn(),
  uploadAttachment: jest.fn().mockResolvedValue("https://bucket/obj"),
  getSignedUrl: jest.fn(),
  getHoursDifference: () => 1,
  sendResponseTicket: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../models/ticket", () => ({ findById: jest.fn() }));
jest.mock("../models/agent", () => ({ findOne: jest.fn(), find: jest.fn() }));
jest.mock("../models/message", () => ({
  find: jest.fn(() => ({ countDocuments: jest.fn().mockResolvedValue(3) })),
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(async (obj) => ({ _id: "111111111111111111111111", files: [], save: jest.fn(), ...obj })),
}));

const TicketModel = require("../models/ticket");
const AgentModel = require("../models/agent");
const MessageModel = require("../models/message");
const { deleteFile, sendResponseTicket, uploadAttachment } = require("../utils");

const app = express();
app.use(express.json());
app.use("/message", require("../controllers/message"));

const buildTicket = () => ({
  _id: TICKET_ID,
  canal: "MAIL",
  status: "OPEN",
  messageCount: 3,
  textMessage: [],
  contactEmail: "jeune@example.com",
  copyRecipient: ["parent@example.com"],
  save: jest.fn().mockResolvedValue(undefined),
});

beforeEach(() => {
  jest.clearAllMocks();
  TicketModel.findById.mockResolvedValue(buildTicket());
  AgentModel.find.mockReturnValue({ select: jest.fn().mockResolvedValue([]) });
});

describe("DELETE /message/s3file/:id (M87)", () => {
  it("refuse de supprimer un objet qui n'est pas une pièce jointe du message", async () => {
    MessageModel.findById.mockResolvedValue({ ticketId: TICKET_ID, files: [{ path: "message/a.pdf" }], save: jest.fn() });

    const res = await request(app).delete(`/message/s3file/${MESSAGE_ID}`).send({ path: "message/autre-ticket.pdf" });

    expect(res.status).toBe(404);
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it("supprime une pièce jointe du message", async () => {
    const message = { ticketId: TICKET_ID, files: [{ path: "message/a.pdf" }], save: jest.fn() };
    MessageModel.findById.mockResolvedValue(message);

    const res = await request(app).delete(`/message/s3file/${MESSAGE_ID}`).send({ path: "message/a.pdf" });

    expect(res.status).toBe(200);
    expect(deleteFile).toHaveBeenCalledWith("message/a.pdf");
    expect(message.files).toEqual([]);
  });
});

describe("POST /message (M88, M92)", () => {
  const post = (body) =>
    request(app)
      .post("/message")
      .send({ message: "<p>Bonjour</p>", ticketId: TICKET_ID, dest: "jeune@example.com", ...body });

  it("refuse une copie vers une adresse étrangère au fil et au support", async () => {
    const res = await post({ copyRecipient: ["relais@evil.com"] });

    expect(res.status).toBe(403);
    expect(sendResponseTicket).not.toHaveBeenCalled();
  });

  it("accepte une copie vers un participant du fil ou un compte du support", async () => {
    AgentModel.find.mockReturnValue({ select: jest.fn().mockResolvedValue([{ email: "referent@snu.gouv.fr" }]) });

    const res = await post({ copyRecipient: ["parent@example.com", "referent@snu.gouv.fr"] });

    expect(res.status).toBe(200);
    expect(sendResponseTicket).toHaveBeenCalled();
  });

  it("assainit le HTML de la réponse avant de le stocker et de l'envoyer", async () => {
    await post({ message: '<p>Bonjour</p><a href="javascript:alert(1)">x</a><img src=x onerror="alert(1)">' });

    const stored = MessageModel.create.mock.calls[0][0].text;
    expect(stored).toContain("Bonjour");
    expect(stored).not.toMatch(/javascript:|onerror/);
  });
});

describe("POST /message/sendEmailFile/:id (M88, L50)", () => {
  const send = (body, files = []) => {
    let req = request(app)
      .post(`/message/sendEmailFile/${TICKET_ID}`)
      .field("body", JSON.stringify({ message: "<p>Voici</p>", dest: "jeune@example.com", ...body }));
    for (const { name, content } of files) req = req.attach(name, content, name);
    return req;
  };

  it("refuse une pièce jointe dont le contenu n'est pas d'un type autorisé, quel que soit son nom", async () => {
    const res = await send({}, [{ name: "facture.pdf", content: Buffer.from("<svg onload=alert(1)></svg>") }]);

    expect(res.status).toBe(400);
    expect(sendResponseTicket).not.toHaveBeenCalled();
    expect(uploadAttachment).not.toHaveBeenCalled();
  });

  it("stocke une pièce jointe autorisée avec le type détecté", async () => {
    const res = await send({}, [{ name: "justificatif.exe", content: PDF }]);

    expect(res.status).toBe(200);
    const [path, stored] = uploadAttachment.mock.calls[0];
    expect(path).toMatch(/^message\/[0-9a-f-]+\.pdf$/);
    expect(stored.mimetype).toBe("application/pdf");
  });

  it("refuse une copie vers une adresse arbitraire", async () => {
    const res = await send({ copyRecipient: ["relais@evil.com"] });

    expect(res.status).toBe(403);
    expect(sendResponseTicket).not.toHaveBeenCalled();
  });

  it("refuse un corps invalide", async () => {
    const res = await send({ copyRecipient: "pas-une-liste" });

    expect(res.status).toBe(400);
  });

  it("refuse plus de pièces jointes que la limite", async () => {
    const files = Array.from({ length: 11 }, (_, i) => ({ name: `f${i}.pdf`, content: PDF }));

    const res = await send({}, files);

    expect(res.status).toBe(400);
    expect(sendResponseTicket).not.toHaveBeenCalled();
  });
});
