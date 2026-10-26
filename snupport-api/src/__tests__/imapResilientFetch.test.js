// Lot P30 (GOO-78) : relève IMAP résiliente aux emails forgés (PM50, PM51 — audit du 25/09/2026).
// readMails ne résolvait jamais sa promesse sur une erreur IMAP/openBox (fetch() restait bloqué
// indéfiniment, lastFetch n'avançait jamais) et parsait tous les messages du lot avec un seul
// Promise.all (un email forgé qui fait rejeter simpleParser perd tout le lot, y compris les
// messages sains). Ces tests pilotent une fausse connexion IMAP (EventEmitter) pour exercer ces
// chemins sans réseau ni Mongo réels.
const { EventEmitter } = require("events");

jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("../config", () => ({ config: { ENVIRONMENT: "test" } }));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../brevo", () => ({ sendTemplate: jest.fn() }));
jest.mock("../models/ticket", () => ({}));
jest.mock("../models/message", () => ({}));
jest.mock("../models/contact", () => ({}));
jest.mock("../models/organisation", () => ({ findOne: jest.fn() }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: jest.fn() }));
jest.mock("../utils", () => ({ uploadAttachment: jest.fn(), weekday: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"] }));
jest.mock("../utils/email", () => ({ weekendRanges: [], isDateInRange: () => false }));
jest.mock("../utils/crypto", () => ({ encrypt: jest.fn() }));
jest.mock("../utils/file", () => ({ getS3Path: jest.fn(), getAttachmentFileName: jest.fn() }));
jest.mock("../utils/imapTicketMatching", () => ({ canSenderJoinTicket: jest.fn() }));
jest.mock("../utils/attachments", () => ({ inspectAttachment: jest.fn() }));
jest.mock("../utils/messageHtml", () => ({ sanitizeMessageHtml: jest.fn((html) => html) }));
jest.mock("../utils/contactVerification", () => ({ resolveUnverifiedContact: jest.fn() }));
jest.mock("../utils/", () => ({ sendNotif: jest.fn(), SENDINBLUE_TEMPLATES: {} }));

jest.mock("mailparser", () => ({ simpleParser: jest.fn() }));

jest.mock("imap", () => {
  class FakeImap extends EventEmitter {
    constructor(config) {
      super();
      this.config = config;
      this.destroyed = false;
      FakeImap.instances.push(this);
    }
    connect() {}
    openBox(box, readOnly, cb) {
      this.openBoxCb = cb;
    }
    search(searchs, cb) {
      this.searchCb = cb;
    }
    fetch() {
      this.fetchEmitter = new EventEmitter();
      return this.fetchEmitter;
    }
    closeBox(cb) {
      cb && cb();
    }
    end() {}
    destroy() {
      this.destroyed = true;
    }
  }
  FakeImap.instances = [];
  return FakeImap;
});

const IMAP = require("imap");
const { simpleParser } = require("mailparser");
const { capture } = require("../sentry");
const OrganisationModel = require("../models/organisation");
const { readMails, fetch: moduleFetch } = require("../imap");

function lastFakeImap() {
  return IMAP.instances[IMAP.instances.length - 1];
}

function emitOneMessage(fakeImap, body) {
  const message = new EventEmitter();
  fakeImap.fetchEmitter.emit("message", message);
  const stream = new EventEmitter();
  message.emit("body", stream);
  stream.emit("data", Buffer.from(body, "utf8"));
  stream.emit("end");
  message.emit("end");
}

beforeEach(() => {
  IMAP.instances.length = 0;
  simpleParser.mockReset();
  capture.mockClear?.();
});

describe("readMails — résilience aux erreurs IMAP (PM50)", () => {
  it("rejette au lieu de rester bloqué indéfiniment quand la connexion IMAP échoue", async () => {
    const promise = readMails({ user: "contact@mail-support.snu.gouv.fr" }, "INBOX", []);
    const fakeImap = lastFakeImap();
    const connectionError = new Error("ECONNREFUSED");

    fakeImap.emit("error", connectionError);

    await expect(promise).rejects.toBe(connectionError);
  });

  it("rejette quand openBox échoue (au lieu d'avaler l'erreur silencieusement)", async () => {
    const promise = readMails({ user: "contact@mail-support.snu.gouv.fr" }, "INBOX", []);
    const fakeImap = lastFakeImap();
    fakeImap.emit("ready");
    const openBoxError = new Error("cannot open box");

    fakeImap.openBoxCb(openBoxError);

    await expect(promise).rejects.toBe(openBoxError);
  });

  it("rejette quand la recherche IMAP échoue (au lieu de résoudre [] comme s'il n'y avait aucun message)", async () => {
    const promise = readMails({ user: "contact@mail-support.snu.gouv.fr" }, "INBOX", []);
    const fakeImap = lastFakeImap();
    fakeImap.emit("ready");
    fakeImap.openBoxCb(null);
    const searchError = new Error("search failed");

    fakeImap.searchCb(searchError, null);

    await expect(promise).rejects.toBe(searchError);
  });

  it("résout [] quand la recherche ne trouve aucun message (comportement normal conservé)", async () => {
    const promise = readMails({ user: "contact@mail-support.snu.gouv.fr" }, "INBOX", []);
    const fakeImap = lastFakeImap();
    fakeImap.emit("ready");
    fakeImap.openBoxCb(null);
    fakeImap.searchCb(null, []);

    await expect(promise).resolves.toEqual([]);
  });

  it("rejette quand le flux de fetch lui-même échoue (coupure réseau en cours de relève)", async () => {
    const promise = readMails({ user: "contact@mail-support.snu.gouv.fr" }, "INBOX", []);
    const fakeImap = lastFakeImap();
    fakeImap.emit("ready");
    fakeImap.openBoxCb(null);
    fakeImap.searchCb(null, [1]);
    const fetchError = new Error("connection reset mid-fetch");

    fakeImap.fetchEmitter.emit("error", fetchError);

    await expect(promise).rejects.toBe(fetchError);
  });
});

describe("readMails — un email forgé ne doit plus perdre tout le lot (PM51)", () => {
  it("garde les messages sains d'un lot même si un autre échoue à l'analyse (allSettled, pas Promise.all)", async () => {
    simpleParser.mockImplementation((body) => {
      if (body === "MALFORMED") return Promise.reject(new Error("parse pathologique"));
      return Promise.resolve({ subject: `parsed:${body}` });
    });

    const promise = readMails({ user: "contact@mail-support.snu.gouv.fr" }, "INBOX", []);
    const fakeImap = lastFakeImap();
    fakeImap.emit("ready");
    fakeImap.openBoxCb(null);
    fakeImap.searchCb(null, [1, 2, 3]);

    emitOneMessage(fakeImap, "GOOD_1");
    emitOneMessage(fakeImap, "MALFORMED");
    emitOneMessage(fakeImap, "GOOD_2");
    fakeImap.fetchEmitter.emit("end");

    const mails = await promise;

    expect(mails).toEqual([{ subject: "parsed:GOOD_1" }, { subject: "parsed:GOOD_2" }]);
    expect(capture).toHaveBeenCalledWith(expect.any(Error));
  });

  it("appelle simpleParser avec skipTextToHtml:true (la linkification de mailparser, touchée par les CVE linkify-it, ne sert à rien ici)", async () => {
    simpleParser.mockResolvedValue({ subject: "ok" });

    const promise = readMails({ user: "contact@mail-support.snu.gouv.fr" }, "INBOX", []);
    const fakeImap = lastFakeImap();
    fakeImap.emit("ready");
    fakeImap.openBoxCb(null);
    fakeImap.searchCb(null, [1]);
    emitOneMessage(fakeImap, "SOME_BODY");
    fakeImap.fetchEmitter.emit("end");

    await promise;

    expect(simpleParser).toHaveBeenCalledWith("SOME_BODY", expect.objectContaining({ skipTextToHtml: true }));
  });

  it("écarte un message dont le corps dépasse la taille maximale sans jamais le passer à simpleParser (PM50 : aucune borne aujourd'hui)", async () => {
    simpleParser.mockResolvedValue({ subject: "should-not-be-called" });

    const promise = readMails({ user: "contact@mail-support.snu.gouv.fr" }, "INBOX", []);
    const fakeImap = lastFakeImap();
    fakeImap.emit("ready");
    fakeImap.openBoxCb(null);
    fakeImap.searchCb(null, [1]);

    const message = new EventEmitter();
    fakeImap.fetchEmitter.emit("message", message);
    const stream = new EventEmitter();
    message.emit("body", stream);
    const oversizedChunk = Buffer.alloc(26 * 1024 * 1024, "a"); // > MAX_MESSAGE_SIZE (25 Mo)
    stream.emit("data", oversizedChunk);
    stream.emit("end");
    message.emit("end");
    fakeImap.fetchEmitter.emit("end");

    const mails = await promise;

    expect(mails).toEqual([]);
    expect(simpleParser).not.toHaveBeenCalled();
    expect(capture).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("Module.fetch — une boîte IMAP en échec ne doit plus bloquer les autres (PM50)", () => {
  it("avance lastFetch pour la boîte qui réussit même si l'autre boîte échoue, et persiste le tout", async () => {
    simpleParser.mockResolvedValue({ subject: "ok" });

    const imapConfigA = { user: "contact@mail-support.snu.gouv.fr", lastFetch: new Date("2026-01-01") };
    const imapConfigB = { user: "inscription@mail-support.snu.gouv.fr", lastFetch: new Date("2026-01-01") };
    const organisation = {
      imapConfig: [imapConfigA, imapConfigB],
      spamEmails: [],
      set: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };
    OrganisationModel.findOne.mockResolvedValue(organisation);

    const fetchPromise = moduleFetch();

    // Laisser l'await sur OrganisationModel.findOne() se résoudre avant que fetch() n'instancie
    // la première connexion IMAP.
    await Promise.resolve();
    await Promise.resolve();

    // Première boîte (A) : connexion IMAP en échec.
    const fakeImapA = lastFakeImap();
    fakeImapA.emit("error", new Error("ECONNREFUSED"));

    // Laisser le catch interne de fetch() traiter le rejet avant la boîte suivante.
    await Promise.resolve();
    await Promise.resolve();

    // Deuxième boîte (B) : succès, sans message.
    const fakeImapB = lastFakeImap();
    fakeImapB.emit("ready");
    fakeImapB.openBoxCb(null);
    fakeImapB.searchCb(null, []);

    await fetchPromise;

    expect(imapConfigA.lastFetch).toEqual(new Date("2026-01-01"));
    expect(imapConfigB.lastFetch).not.toEqual(new Date("2026-01-01"));
    expect(organisation.save).toHaveBeenCalledTimes(1);
    expect(capture).toHaveBeenCalledWith(expect.any(Error));
  });
});
