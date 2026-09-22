// Reproduction de H86 : un mail entrant est rattaché à n'importe quel ticket sur la seule
// foi d'éléments contrôlés par l'expéditeur (numéro « [#1234] » dans le sujet, ou premier
// en-tête References), sans vérifier que le From appartient bien au fil.

const mockCaptured = [];

jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("imap", () => jest.fn());
jest.mock("mailparser", () => ({ simpleParser: jest.fn() }));
jest.mock("../config", () => ({ config: { ENVIRONMENT: "test" } }));
jest.mock("../sentry", () => ({ capture: (e) => mockCaptured.push(e) }));
jest.mock("../brevo", () => ({ sendTemplate: jest.fn() }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: async (t) => t }));
jest.mock("../utils/email", () => ({ weekendRanges: [], isDateInRange: () => false }));
jest.mock("../utils/crypto", () => ({ encrypt: (b) => b }));
jest.mock("../utils/file", () => ({ getS3Path: (n) => `message/${n}` }));
jest.mock("../utils", () => ({
  uploadAttachment: jest.fn(),
  weekday: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
  sendNotif: jest.fn(),
  SENDINBLUE_TEMPLATES: { MESSAGE_RECEIVED: "1255", SNUPPORT_CLOSED: "2416" },
}));

// Fausses collections en mémoire, suffisantes pour la logique de rattachement.
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

const VICTIM = "victime@example.com";
const ATTACKER = "attaquant@evil.tld";

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
  mockDb.messages.push(mockMakeDoc({ _id: "msg_victime", messageId: "<fil-victime@mail-support.snu.gouv.fr>", ticketId: "ticket_victime", fromEmail: VICTIM }));
  mockDb.contacts.push(mockMakeDoc({ _id: "contact_victime", email: VICTIM, firstName: "Alice", lastName: "", attributes: [] }));
  return ticket;
}

function attackerMail(overrides) {
  return {
    fromAddress: ATTACKER,
    fromName: "Service Support",
    messageId: "<attaque-1@evil.tld>",
    references: [],
    subject: "Re: Problème de dossier d'inscription",
    text: "Bonjour, pouvez-vous me renvoyer le dossier complet ?",
    html: "<p>Bonjour</p>",
    textHtml: "",
    toAdress: "contact@mail-support.snu.gouv.fr",
    copyRecipient: [],
    attachments: [],
    ...overrides,
  };
}

beforeEach(() => {
  mockDb.tickets = [];
  mockDb.messages = [];
  mockDb.contacts = [];
  mockCaptured.length = 0;
});

describe("H86 — rattachement d'un mail entrant à un ticket", () => {
  it("ne rattache pas un mail à un ticket parce que son sujet contient le numéro du ticket", async () => {
    const victimTicket = seedVictimTicket();

    await addMessage(attackerMail({ subject: "Re: Problème de dossier d'inscription [#4231]", ticketNumber: "4231" }));

    expect(mockCaptured).toEqual([]);
    const injected = mockDb.messages.find((m) => m.messageId === "<attaque-1@evil.tld>");
    expect(injected).toBeDefined();
    expect(injected.ticketId).not.toBe(victimTicket._id);
  });

  it("ne rattache pas un mail à un ticket parce qu'il cite un Message-ID du fil", async () => {
    const victimTicket = seedVictimTicket();

    await addMessage(attackerMail({ references: ["<fil-victime@mail-support.snu.gouv.fr>"] }));

    expect(mockCaptured).toEqual([]);
    const injected = mockDb.messages.find((m) => m.messageId === "<attaque-1@evil.tld>");
    expect(injected.ticketId).not.toBe(victimTicket._id);
  });

  it("ne rouvre pas un ticket clos sur un mail d'un tiers", async () => {
    const victimTicket = seedVictimTicket();

    await addMessage(attackerMail({ subject: "Re: … [#4231]", ticketNumber: "4231" }));

    expect(victimTicket.status).toBe("CLOSED");
  });

  it("n'injecte pas les CC choisis par un tiers dans le fil de la victime", async () => {
    const victimTicket = seedVictimTicket();

    await addMessage(attackerMail({ subject: "Re: … [#4231]", ticketNumber: "4231", copyRecipient: ["relais@evil.tld"] }));

    const onVictimTicket = mockDb.messages.filter((m) => m.ticketId === victimTicket._id);
    const allCc = onVictimTicket.flatMap((m) => m.copyRecipient || []);
    expect(allCc).not.toContain("relais@evil.tld");
  });

  it("rattache toujours la réponse légitime du contact du ticket", async () => {
    const victimTicket = seedVictimTicket();

    await addMessage(attackerMail({ fromAddress: VICTIM, fromName: "Alice", messageId: "<reponse-alice@example.com>", subject: "Re: … [#4231]", ticketNumber: "4231" }));

    expect(mockCaptured).toEqual([]);
    const reply = mockDb.messages.find((m) => m.messageId === "<reponse-alice@example.com>");
    expect(reply.ticketId).toBe(victimTicket._id);
    expect(victimTicket.status).toBe("OPEN");
  });
});
