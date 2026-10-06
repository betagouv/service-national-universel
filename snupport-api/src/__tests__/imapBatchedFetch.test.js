// Lot V06b (GOO-169) : relève IMAP résiliente aux emails mal formés et mémoire bornée (E-4, E-5).
// La chaîne complète Module.fetch → readMails → extractMailData → addMessage est exercée sur une
// boîte IMAP scriptée (helpers/fakeImapMailbox.js) et des collections en mémoire : aucun réseau.

const mockCaptured = [];

jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("imap", () => require("./helpers/fakeImapMailbox"));
jest.mock("mailparser", () => ({ simpleParser: jest.fn() }));
jest.mock("../config", () => ({ config: { ENVIRONMENT: "test" } }));
jest.mock("../sentry", () => ({ capture: (e) => mockCaptured.push(e) }));
jest.mock("../brevo", () => ({ sendTemplate: jest.fn() }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: async (t) => t }));
jest.mock("../utils/email", () => ({ weekendRanges: [], isDateInRange: () => false }));
jest.mock("../utils/crypto", () => ({ encrypt: (b) => b }));
jest.mock("../utils/file", () => ({ getS3Path: (n) => `message/${n}`, getAttachmentFileName: (n) => n }));
jest.mock("../utils", () => ({
  uploadAttachment: jest.fn(),
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
    require("imap").events.push("create");
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

const FakeImap = require("imap");
const { simpleParser } = require("mailparser");
const OrganisationModel = require("../models/organisation");
const { fetch: moduleFetch } = require("../imap");

const INITIAL_LAST_FETCH = new Date(2026, 0, 1, 0, 0);
const parsedByKey = new Map();
let inFlightParses;
let maxInFlightParses;
let logSpy;

function parsedMail(id, overrides = {}) {
  return {
    subject: `Sujet ${id}`,
    text: `texte ${id}`,
    html: `<p>${id}</p>`,
    messageId: `<${id}@ext.tld>`,
    from: { value: [{ name: "Alice", address: `${id}@ext.tld` }] },
    to: { value: [{ address: "contact@mail-support.snu.gouv.fr" }] },
    attachments: [],
    ...overrides,
  };
}

function entry(seq, id, date, overrides = {}) {
  parsedByKey.set(id, parsedMail(id, overrides));
  return { seq, body: id, date };
}

function bigEntry(seq, id, date, bytes) {
  parsedByKey.set(id, parsedMail(id));
  return { seq, buffer: Buffer.concat([Buffer.from(`${id}:`), Buffer.alloc(bytes, "a")]), date };
}

function makeOrganisation() {
  const imapConfig = { user: "contact@mail-support.snu.gouv.fr", lastFetch: new Date(INITIAL_LAST_FETCH) };
  const organisation = { imapConfig: [imapConfig], spamEmails: [], set: jest.fn(), save: jest.fn().mockResolvedValue(undefined) };
  OrganisationModel.findOne.mockResolvedValue(organisation);
  return { organisation, imapConfig };
}

const ingestedIds = () => mockDb.messages.map((m) => m.messageId);

beforeEach(() => {
  mockCaptured.length = 0;
  mockDb.tickets = [{ _id: "ticket_0", number: "100" }];
  mockDb.messages = [];
  mockDb.contacts = [];
  parsedByKey.clear();
  inFlightParses = 0;
  maxInFlightParses = 0;
  FakeImap.reset();
  simpleParser.mockReset();
  simpleParser.mockImplementation(async (body) => {
    inFlightParses++;
    maxInFlightParses = Math.max(maxInFlightParses, inFlightParses);
    await new Promise((resolve) => setImmediate(resolve));
    inFlightParses--;
    return parsedByKey.get(body.length > 100 ? body.slice(0, body.indexOf(":")) : body);
  });
  logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  logSpy.mockRestore();
});

describe("Module.fetch — un email sans expéditeur ne bloque plus la boîte (E-4)", () => {
  it("ignore les emails sans From, avec un From vide ou sans adresse, ingère les suivants et avance lastFetch", async () => {
    const day = (n) => new Date(2026, 0, 1 + n, 10);
    FakeImap.reset([
      entry(1, "sansfrom", day(1), { from: undefined }),
      entry(2, "fromvide", day(1), { from: { value: [] } }),
      entry(3, "sansadresse", day(1), { from: { value: [{ name: "Bob" }] } }),
      entry(4, "bon", day(2)),
    ]);
    const { imapConfig } = makeOrganisation();

    await moduleFetch();

    expect(ingestedIds()).toEqual(["<bon@ext.tld>"]);
    expect(imapConfig.lastFetch.getTime()).toBeGreaterThan(Date.now() - 60_000);
    expect(mockCaptured).toEqual([]);
  });

  it("journalise l'email ignoré sans adresse, sujet ni contenu", async () => {
    FakeImap.reset([entry(1, "sansfrom", new Date(2026, 0, 2), { from: undefined, subject: "Sujet confidentiel", text: "contenu confidentiel" })]);
    makeOrganisation();

    await moduleFetch();

    const logged = logSpy.mock.calls.flat().join(" ");
    expect(logged).toContain("sansfrom@ext.tld");
    expect(logged).not.toMatch(/confidentiel|Alice/);
  });

  it("ingère un email dont le To est vide, avec le repli sur la boîte contact@", async () => {
    FakeImap.reset([entry(1, "tovide", new Date(2026, 0, 2), { to: { value: [] } }), entry(2, "bon", new Date(2026, 0, 2))]);
    const { imapConfig } = makeOrganisation();

    await moduleFetch();

    expect(ingestedIds()).toEqual(["<tovide@ext.tld>", "<bon@ext.tld>"]);
    expect(mockDb.messages[0].toEmail).toBeUndefined();
    expect(mockDb.tickets.find((t) => t.subject === "Sujet tovide").imapEmail).toBe("contact@mail-support.snu.gouv.fr");
    expect(imapConfig.lastFetch.getTime()).toBeGreaterThan(Date.now() - 60_000);
  });
});

describe("Module.fetch — un lot normal est traité comme avant", () => {
  it("crée un ticket et un message par email, avec les mêmes champs, et avance lastFetch", async () => {
    FakeImap.reset([entry(1, "un", new Date(2026, 0, 2)), entry(2, "deux", new Date(2026, 0, 2), { to: { value: [{ address: "inscription@mail-support.snu.gouv.fr" }] } })]);
    const { imapConfig, organisation } = makeOrganisation();

    await moduleFetch();

    expect(ingestedIds()).toEqual(["<un@ext.tld>", "<deux@ext.tld>"]);
    expect(mockDb.messages[0]).toMatchObject({ subject: "Sujet un", fromEmail: "un@ext.tld", toEmail: "contact@mail-support.snu.gouv.fr", rawText: "texte un" });
    expect(mockDb.tickets.find((t) => t.subject === "Sujet deux")).toMatchObject({ source: "MAIL", status: "NEW", number: 102, imapEmail: "inscription@mail-support.snu.gouv.fr" });
    expect(simpleParser).toHaveBeenCalledWith("un", expect.objectContaining({ skipTextToHtml: true }));
    expect(imapConfig.lastFetch.getTime()).toBeGreaterThan(Date.now() - 60_000);
    expect(organisation.save).toHaveBeenCalledTimes(1);
    expect(mockCaptured).toEqual([]);
  });
});

describe("Module.fetch — mémoire bornée en agrégat (E-5)", () => {
  it("télécharge par groupes de 10 messages et analyse au plus 3 emails à la fois, sans en perdre", async () => {
    FakeImap.reset(Array.from({ length: 25 }, (_, i) => entry(i + 1, `m${i + 1}`, new Date(2026, 0, 2))));
    const { imapConfig } = makeOrganisation();

    await moduleFetch();

    expect(FakeImap.fetchCalls.map((ids) => ids.length)).toEqual([10, 10, 5]);
    expect(maxInFlightParses).toBeGreaterThan(0);
    expect(maxInFlightParses).toBeLessThanOrEqual(3);
    expect(ingestedIds()).toHaveLength(25);
    expect(imapConfig.lastFetch.getTime()).toBeGreaterThan(Date.now() - 60_000);
  });

  it("traite chaque groupe avant de télécharger le suivant", async () => {
    FakeImap.reset(Array.from({ length: 25 }, (_, i) => entry(i + 1, `m${i + 1}`, new Date(2026, 0, 2))));
    makeOrganisation();

    await moduleFetch();

    const secondFetch = FakeImap.events.indexOf("fetch", FakeImap.events.indexOf("fetch") + 1);
    expect(FakeImap.events.slice(0, secondFetch).filter((e) => e === "create")).toHaveLength(10);
  });

  it("diffère sans les perdre les emails qui dépasseraient le budget d'octets d'un groupe, et lastFetch ne dépasse pas le dernier traité", async () => {
    const MB = 1024 * 1024;
    FakeImap.reset([bigEntry(1, "BIG1", new Date(2026, 0, 3, 9), 20 * MB), bigEntry(2, "BIG2", new Date(2026, 0, 4, 9), 20 * MB), bigEntry(3, "BIG3", new Date(2026, 0, 5, 9), 20 * MB)]);
    const { imapConfig } = makeOrganisation();

    await moduleFetch();

    expect(ingestedIds()).toEqual(["<BIG1@ext.tld>", "<BIG2@ext.tld>"]);
    expect(imapConfig.lastFetch).toEqual(new Date(2026, 0, 4, 9));
    expect(mockCaptured).toEqual([]);

    // Cycle suivant : la recherche repart du jour du dernier traité et le message différé est ingéré.
    FakeImap.reset([bigEntry(2, "BIG2", new Date(2026, 0, 4, 9), 1024), bigEntry(3, "BIG3", new Date(2026, 0, 5, 9), 20 * MB)]);
    await moduleFetch();

    expect(FakeImap.searchCalls[0]).toEqual(["ALL", ["SINCE", "JANUARY 04, 2026"]]);
    expect(ingestedIds()).toEqual(["<BIG1@ext.tld>", "<BIG2@ext.tld>", "<BIG3@ext.tld>"]);
    expect(imapConfig.lastFetch.getTime()).toBeGreaterThan(Date.now() - 60_000);
  }, 30000);

  it("plafonne le nombre d'emails par cycle : le reste est repris au cycle suivant, lastFetch s'arrête au dernier traité", async () => {
    FakeImap.reset(Array.from({ length: 205 }, (_, i) => entry(i + 1, `m${i + 1}`, new Date(2026, 0, 2 + i, 10))));
    const { imapConfig } = makeOrganisation();

    await moduleFetch();

    expect(ingestedIds()).toHaveLength(200);
    expect(ingestedIds()).not.toContain("<m201@ext.tld>");
    expect(imapConfig.lastFetch).toEqual(new Date(2026, 0, 2 + 199, 10));
    expect(mockCaptured).toEqual([]);
  }, 30000);

  it("ne fait pas avancer lastFetch et alerte quand le plafond est atteint sans progrès de date possible", async () => {
    FakeImap.reset(Array.from({ length: 205 }, (_, i) => entry(i + 1, `m${i + 1}`, new Date(2026, 0, 1, 1, i % 60))));
    const { imapConfig } = makeOrganisation();

    await moduleFetch();

    expect(imapConfig.lastFetch).toEqual(INITIAL_LAST_FETCH);
    expect(mockCaptured).toHaveLength(1);
    expect(mockCaptured[0]).toBeInstanceOf(Error);
  }, 30000);
});
