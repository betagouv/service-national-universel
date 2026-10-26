// PM49 : une pièce jointe IMAP acceptée par inspectAttachment (magic numbers) mais infectée doit
// être écartée avant tout chiffrement/upload, comme le fait déjà api/src/controllers/SNUpport.ts.

const mockCaptured = [];
const mockScanBuffer = jest.fn();

jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("imap", () => jest.fn());
jest.mock("mailparser", () => ({ simpleParser: jest.fn() }));
jest.mock("../config", () => ({ config: { ENVIRONMENT: "test" } }));
jest.mock("../sentry", () => ({ capture: (e) => mockCaptured.push(e) }));
jest.mock("../brevo", () => ({ sendTemplate: jest.fn() }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: async (t) => t }));
jest.mock("../utils/email", () => ({ weekendRanges: [], isDateInRange: () => false }));
jest.mock("../utils/crypto", () => ({ encrypt: (b) => b }));
jest.mock("../utils/file", () => ({ getS3Path: (n) => `message/${n}`, getAttachmentFileName: (n) => n }));
jest.mock("../utils/virusScanner", () => ({ initVirusScanner: jest.fn(), scanBuffer: (...args) => mockScanBuffer(...args) }));
jest.mock("../utils", () => ({
  uploadAttachment: jest.fn().mockResolvedValue("https://cellar/message/piece.pdf"),
  weekday: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  sendNotif: jest.fn(),
  SENDINBLUE_TEMPLATES: { MESSAGE_RECEIVED: "1255", SNUPPORT_CLOSED: "2416" },
}));

const mockDb = { tickets: [], messages: [], contacts: [] };

function mockMatch(doc, query) {
  return Object.entries(query).every(([k, v]) => String(doc[k]) === String(v));
}

function mockMakeDoc(obj) {
  return {
    ...obj,
    save: async function () {
      return this;
    },
    set(patch) {
      Object.assign(this, patch);
    },
  };
}

jest.mock("../models/ticket", () => ({
  findOne: async (q) => mockDb.tickets.find((t) => mockMatch(t, q)) || null,
  findById: async (id) => mockDb.tickets.find((t) => String(t._id) === String(id)) || null,
  find: () => ({
    sort: () => ({
      collation: () => ({
        limit: () =>
          mockDb.tickets
            .slice()
            .sort((a, b) => Number(b.number) - Number(a.number))
            .slice(0, 1),
      }),
    }),
  }),
  create: async (obj) => {
    const t = mockMakeDoc({ _id: `ticket_${mockDb.tickets.length + 1}`, ...obj });
    mockDb.tickets.push(t);
    return t;
  },
}));
jest.mock("../models/message", () => ({
  findOne: async (q) => mockDb.messages.find((m) => mockMatch(m, q)) || null,
  create: async (obj) => {
    const m = mockMakeDoc({ _id: `msg_${mockDb.messages.length + 1}`, ...obj });
    mockDb.messages.push(m);
    return m;
  },
}));
jest.mock("../models/contact", () => ({
  findOne: async (q) => mockDb.contacts.find((c) => mockMatch(c, q)) || null,
  create: async (obj) => {
    const c = mockMakeDoc({ _id: `contact_${mockDb.contacts.length + 1}`, attributes: [], ...obj });
    mockDb.contacts.push(c);
    return c;
  },
}));
jest.mock("../models/organisation", () => ({ findOne: jest.fn() }));

const { addMessage } = require("../imap");
const { uploadAttachment } = require("../utils");

const VICTIM = "victime@example.com";

function seedVictimTicket() {
  const ticket = mockMakeDoc({
    _id: "ticket_victime",
    number: "4231",
    status: "CLOSED",
    messageCount: 3,
    canal: "MAIL",
    contactEmail: VICTIM,
    contactId: "contact_victime",
    copyRecipient: [],
    subject: "Problème de dossier d'inscription",
  });
  mockDb.tickets.push(ticket);
  mockDb.contacts.push(mockMakeDoc({ _id: "contact_victime", email: VICTIM, firstName: "Alice", lastName: "", attributes: [] }));
  return ticket;
}

// Signature PDF minimale : suffit à ce que file-type détecte application/pdf (inspectAttachment).
const PDF_SIGNATURE = Buffer.from("%PDF-1.4\n%âãÏÓ\n");

function mailWithAttachment(overrides = {}) {
  return {
    fromAddress: VICTIM,
    fromName: "Alice",
    messageId: "<msg-1@example.com>",
    references: [],
    subject: "Nouvelle demande",
    text: "Voir pièce jointe",
    html: "<p>Voir pièce jointe</p>",
    textHtml: "",
    toAdress: "contact@mail-support.snu.gouv.fr",
    copyRecipient: [],
    attachments: [{ filename: "cni.pdf", contentType: "application/pdf", content: PDF_SIGNATURE }],
    ...overrides,
  };
}

beforeEach(() => {
  mockDb.tickets = [];
  mockDb.messages = [];
  mockDb.contacts = [];
  mockCaptured.length = 0;
  mockScanBuffer.mockReset();
  uploadAttachment.mockClear();
});

describe("PM49 — scan antivirus des pièces jointes IMAP entrantes", () => {
  it("stocke la pièce jointe quand le scan antivirus ne détecte rien", async () => {
    seedVictimTicket();
    mockScanBuffer.mockResolvedValue({ infected: false });

    await addMessage(mailWithAttachment());

    expect(mockScanBuffer).toHaveBeenCalledTimes(1);
    expect(uploadAttachment).toHaveBeenCalledTimes(1);
    const stored = mockDb.messages.find((m) => m.messageId === "<msg-1@example.com>");
    expect(stored.files).toHaveLength(1);
  });

  it("écarte la pièce jointe sans l'uploader quand le scan antivirus la signale infectée", async () => {
    seedVictimTicket();
    mockScanBuffer.mockResolvedValue({ infected: true });

    await addMessage(mailWithAttachment());

    expect(mockScanBuffer).toHaveBeenCalledTimes(1);
    expect(uploadAttachment).not.toHaveBeenCalled();
    const stored = mockDb.messages.find((m) => m.messageId === "<msg-1@example.com>");
    expect(stored.files).toHaveLength(0);
  });

  it("ne scanne pas une pièce jointe déjà écartée par inspectAttachment (magic numbers)", async () => {
    seedVictimTicket();
    mockScanBuffer.mockResolvedValue({ infected: false });

    await addMessage(mailWithAttachment({ attachments: [{ filename: "script.html", contentType: "text/html", content: Buffer.from("<html></html>") }] }));

    expect(mockScanBuffer).not.toHaveBeenCalled();
    expect(uploadAttachment).not.toHaveBeenCalled();
  });
});
