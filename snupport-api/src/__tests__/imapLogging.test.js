// PL20 (lot P32, audit du 25/09/2026) : addMessage dumpait sur stdout, hors du filet de
// redaction winston, soit le document Message trouvé (nom, sujet, expéditeur), soit le mail
// entrant complet (corps text/html, expéditeur, pièces jointes) à chaque échec de traitement.
// Seul l'identifiant du message doit être journalisé, via le logger winston (redactLogInfo).
const { EventEmitter } = require("events");

jest.mock("node-cron", () => ({ schedule: jest.fn() }));
jest.mock("../config", () => ({ config: { ENVIRONMENT: "test" } }));
jest.mock("../sentry", () => ({ capture: jest.fn() }));
jest.mock("../brevo", () => ({ sendTemplate: jest.fn() }));
jest.mock("../models/ticket", () => ({ findOne: jest.fn(), find: jest.fn() }));
jest.mock("../models/message", () => ({ findOne: jest.fn() }));
jest.mock("../models/contact", () => ({}));
jest.mock("../models/organisation", () => ({ findOne: jest.fn() }));
jest.mock("../utils/ventilation", () => ({ matchVentilationRule: jest.fn() }));
jest.mock("../utils", () => ({ uploadAttachment: jest.fn(), weekday: ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"] }));
jest.mock("../utils/email", () => ({ weekendRanges: [], isDateInRange: () => false }));
jest.mock("../utils/crypto", () => ({ encrypt: jest.fn() }));
jest.mock("../utils/file", () => ({ getS3Path: jest.fn(), getAttachmentFileName: jest.fn() }));
jest.mock("../utils/imapTicketMatching", () => ({ canSenderJoinTicket: jest.fn().mockReturnValue(true) }));
jest.mock("../utils/attachments", () => ({ inspectAttachment: jest.fn() }));
jest.mock("../utils/messageHtml", () => ({ sanitizeMessageHtml: jest.fn((html) => html) }));
jest.mock("../utils/contactVerification", () => ({ resolveUnverifiedContact: jest.fn() }));
jest.mock("imap", () => class {});
jest.mock("mailparser", () => ({ simpleParser: jest.fn() }));

const TicketModel = require("../models/ticket");
const MessageModel = require("../models/message");
const { resolveUnverifiedContact } = require("../utils/contactVerification");
const { logger } = require("../logger");
const { addMessage } = require("../imap");

describe("addMessage - journalisation (PL20)", () => {
  let consoleLogSpy;
  let loggerErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    loggerErrorSpy = jest.spyOn(logger, "error").mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    loggerErrorSpy.mockRestore();
  });

  it("ne dump pas le document message trouvé quand aucun ticket ne lui correspond", async () => {
    const firstMessage = { messageId: "premier-message-id", ticketId: "ticket-introuvable", subject: "Sujet confidentiel" };
    MessageModel.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(firstMessage);
    TicketModel.findOne.mockResolvedValueOnce(null);
    resolveUnverifiedContact.mockResolvedValue({ identity: { _id: "contact-1", email: "usager@example.org" }, identityVerified: false });
    TicketModel.find.mockReturnValue({ sort: () => ({ collation: () => ({ limit: () => [{ number: "1" }] }) }) });

    const mail = {
      fromAddress: "usager@example.org",
      fromName: "Usager",
      references: ["premier-message-id"],
      messageId: "nouveau-message-id",
      subject: "Sujet",
      text: "corps confidentiel",
    };

    await addMessage(mail);

    expect(consoleLogSpy).not.toHaveBeenCalled();
    const errorCalls = loggerErrorSpy.mock.calls.map((call) => JSON.stringify(call));
    expect(errorCalls.some((call) => call.includes("premier-message-id"))).toBe(true);
    expect(errorCalls.some((call) => call.includes("Sujet confidentiel"))).toBe(false);
  });

  it("ne dump pas le mail entrant complet quand le traitement échoue", async () => {
    resolveUnverifiedContact.mockRejectedValue(new Error("mongo indisponible"));

    const mail = {
      fromAddress: "usager@example.org",
      fromName: "Usager",
      messageId: "message-en-echec",
      subject: "Sujet très privé",
      text: "corps du message avec des données de santé",
      references: [],
    };

    await addMessage(mail);

    expect(consoleLogSpy).not.toHaveBeenCalled();
    const errorCalls = loggerErrorSpy.mock.calls.map((call) => JSON.stringify(call));
    expect(errorCalls.some((call) => call.includes("message-en-echec"))).toBe(true);
    expect(errorCalls.some((call) => call.includes("Sujet très privé"))).toBe(false);
    expect(errorCalls.some((call) => call.includes("corps du message"))).toBe(false);
  });
});
