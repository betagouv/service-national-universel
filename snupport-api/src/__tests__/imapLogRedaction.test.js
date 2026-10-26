// PL20 (audit du 25/09/2026) : en cas d'erreur pendant le traitement d'un mail entrant,
// addMessage journalisait l'objet mail complet (sujet, corps texte/HTML, pièces jointes,
// adresses from/to/cc) via console.log("error fetching mail : ", mail). Seul messageId,
// un identifiant sans PII, doit apparaître dans les logs.
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
// resolveUnverifiedContact volontairement non mocké de façon utilisable : sa valeur de retour par
// défaut (undefined) fait échouer la déstructuration `{ identity, identityVerified }` dans
// addMessage, ce qui déclenche le chemin d'erreur ciblé par ce test.
jest.mock("../utils/contactVerification", () => ({ resolveUnverifiedContact: jest.fn() }));
jest.mock("../utils/", () => ({ sendNotif: jest.fn(), SENDINBLUE_TEMPLATES: {} }));
jest.mock("mailparser", () => ({ simpleParser: jest.fn() }));
jest.mock("imap", () => class {});

const { capture } = require("../sentry");
const { addMessage } = require("../imap");

describe("addMessage — pas de dump PII dans les logs en cas d'erreur (PL20)", () => {
  it("ne journalise que le messageId du mail, jamais son sujet, son corps ou ses adresses", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const mail = {
      messageId: "<mail-123@example.com>",
      fromAddress: "victime@example.com",
      fromName: "Victime",
      subject: "Sujet confidentiel",
      text: "Corps du message avec des informations personnelles",
      html: "<p>Corps du message avec des informations personnelles</p>",
      references: [],
      attachments: [],
    };

    await addMessage(mail);

    expect(capture).toHaveBeenCalledWith(expect.any(Error));

    const loggedText = consoleSpy.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(loggedText).toContain("mail-123@example.com");
    expect(loggedText).not.toContain("victime@example.com");
    expect(loggedText).not.toContain("Sujet confidentiel");
    expect(loggedText).not.toContain("informations personnelles");

    consoleSpy.mockRestore();
  });
});
