// PM49 (H86 résiduel) : une pièce jointe d'un mail entrant (expéditeur jamais authentifié) était
// stockée et servie aux agents (puis rejointe aux emails « avec historique ») sans être analysée.
// Ce fichier vérifie qu'addMessage appelle désormais le scan antivirus après inspectAttachment
// (magic numbers) et avant l'upload, et qu'une pièce jointe infectée est écartée comme une pièce
// jointe de type non autorisé (H86) — jamais stockée, jamais uploadée.

const mockCaptured = [];

jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("imap", () => jest.fn());
jest.mock("mailparser", () => ({ simpleParser: jest.fn() }));
jest.mock("../config", () => ({ config: { ENVIRONMENT: "test" } }));
jest.mock("../sentry", () => ({ capture: (e) => mockCaptured.push(e), captureMessage: jest.fn() }));
jest.mock("../brevo", () => ({ sendTemplate: jest.fn() }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: async (t) => t }));
jest.mock("../utils/email", () => ({ weekendRanges: [], isDateInRange: () => false }));
jest.mock("../utils/crypto", () => ({ encrypt: (b) => b }));
jest.mock("../utils/file", () => ({ getS3Path: (n) => `message/${n}`, getAttachmentFileName: (n) => n }));

const uploadAttachment = jest.fn().mockResolvedValue("https://cellar/message/piece.pdf");
jest.mock("../utils", () => ({
  uploadAttachment,
  weekday: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  sendNotif: jest.fn(),
  SENDINBLUE_TEMPLATES: { MESSAGE_RECEIVED: "1255", SNUPPORT_CLOSED: "2416" },
}));

const scanBuffer = jest.fn();
jest.mock("../utils/virusScanner", () => ({ scanBuffer }));

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

const PDF = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n%%EOF\n", "binary");

function mailWithAttachment(overrides) {
  return {
    fromAddress: "contact@example.com",
    fromName: "Un contact",
    messageId: "<mail-1@example.com>",
    references: [],
    subject: "Une demande",
    text: "Bonjour",
    html: "<p>Bonjour</p>",
    toAdress: "contact@mail-support.snu.gouv.fr",
    copyRecipient: [],
    attachments: [{ filename: "piece.pdf", contentType: "application/pdf", content: PDF }],
    ...overrides,
  };
}

beforeEach(() => {
  // Un ticket existant est nécessaire : addMessage numérote un nouveau ticket à partir du
  // dernier (TicketModel.find().sort(...).limit(1)), même quand le contact est inconnu.
  mockDb.tickets = [mockMakeDoc({ _id: "ticket_base", number: "999", status: "CLOSED", messageCount: 0, canal: "MAIL", contactEmail: "autre@example.com", copyRecipient: [] })];
  mockDb.messages = [];
  mockDb.contacts = [];
  mockCaptured.length = 0;
  uploadAttachment.mockClear();
  scanBuffer.mockReset();
});

describe("PM49 — scan antivirus des pièces jointes d'un mail entrant", () => {
  it("stocke une pièce jointe saine (scanBuffer appelé après inspectAttachment, avant l'upload)", async () => {
    scanBuffer.mockResolvedValue({ infected: false });

    await addMessage(mailWithAttachment());

    expect(scanBuffer).toHaveBeenCalledTimes(1);
    expect(scanBuffer.mock.calls[0][0]).toEqual(PDF);
    expect(uploadAttachment).toHaveBeenCalledTimes(1);
    const stored = mockDb.messages.find((m) => m.messageId === "<mail-1@example.com>");
    expect(stored.files).toHaveLength(1);
  });

  it("écarte une pièce jointe infectée sans jamais l'uploader ni la stocker", async () => {
    scanBuffer.mockResolvedValue({ infected: true });

    await addMessage(mailWithAttachment({ messageId: "<mail-infecte@example.com>" }));

    expect(uploadAttachment).not.toHaveBeenCalled();
    const stored = mockDb.messages.find((m) => m.messageId === "<mail-infecte@example.com>");
    expect(stored.files ?? []).toHaveLength(0);
  });

  it("n'appelle pas le scan pour une pièce jointe déjà écartée par inspectAttachment (type non autorisé)", async () => {
    scanBuffer.mockResolvedValue({ infected: false });
    const HTML = Buffer.from("<html><script>alert(1)</script></html>");

    await addMessage(mailWithAttachment({ messageId: "<mail-html@example.com>", attachments: [{ filename: "x.html", contentType: "text/html", content: HTML }] }));

    expect(scanBuffer).not.toHaveBeenCalled();
    expect(uploadAttachment).not.toHaveBeenCalled();
  });
});
