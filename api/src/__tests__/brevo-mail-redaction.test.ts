import fetch from "node-fetch";
import { captureMessage } from "../sentry";
import { logger } from "../logger";
import { sendEmail, sendSMS, sendTemplate } from "../brevo";

jest.mock("node-fetch", () => jest.fn());
jest.mock("../sentry", () => ({ capture: jest.fn(), captureMessage: jest.fn() }));
jest.mock("../logger", () => ({ logger: { debug: jest.fn(), warn: jest.fn(), info: jest.fn(), error: jest.fn() } }));
jest.mock("../rateLimiters", () => ({
  rateLimiterContactSIB: { call: (fn: () => unknown) => Promise.resolve(fn()) },
  rateLimiterDeleteContactSIB: { call: (fn: () => unknown) => Promise.resolve(fn()) },
}));

jest.mock("../config", () => ({
  config: {
    ENVIRONMENT: "production",
    ENABLE_SENDINBLUE: true,
    SENDINBLUEKEY: "test-key",
    ENABLE_FLATTEN_ERROR_LOGS: false,
    ENABLE_SENTRY: false,
    LOG_LEVEL: "error",
    MAIL_TRANSPORT: "BREVO",
    APP_URL: "https://moncompte.snu.gouv.fr",
  },
}));
// le module bouchonné est mutable : chaque test peut déplacer l'environnement
const mockConfig = jest.requireMock("../config").config;

// même convention que brevo-sync.test.ts : un jeton factice sans entropie, invisible pour gitleaks
const TOKEN = "a".repeat(40);
const CTA = `https://moncompte.snu.gouv.fr/representants-legaux/presentation?token=${TOKEN}&parent=1`;
const HTML = `Bonjour Camille Martin, <a href="${CTA}">donner votre consentement</a>`;

// Identifiant du template PARENT1_CONSENT (snu-lib) : déclenche la branche "Parent sans email"
const PARENT1_CONSENT = "1300";

function mockBrevoResponse(body: unknown) {
  (fetch as unknown as jest.Mock).mockResolvedValue({
    headers: { raw: () => ({ "content-type": ["application/json"] }) },
    json: async () => body,
  });
}

function sentryExtras(): unknown[] {
  return (captureMessage as jest.Mock).mock.calls.map(([, context]) => context?.extra);
}

/** Tout ce qui a été transmis à Sentry et aux logs, sérialisé */
function everythingReported(): string {
  return JSON.stringify({
    sentry: (captureMessage as jest.Mock).mock.calls,
    logs: (logger.debug as jest.Mock).mock.calls,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockConfig.ENVIRONMENT = "production";
  mockConfig.SENDINBLUEKEY = "test-key";
  mockBrevoResponse({ code: "unauthorized", message: "Key not found" });
});

describe("brevo — aucun contenu de message vers Sentry ni vers les logs", () => {
  it("ne remonte ni le contenu HTML ni le lien à jeton quand un email échoue", async () => {
    await sendEmail({ name: "Camille Martin", email: "camille@example.org" } as any, "Consentement", HTML);

    expect((captureMessage as jest.Mock).mock.calls[0][0]).toBe("Error sending an email");
    expect(everythingReported()).not.toContain(TOKEN);
    expect(everythingReported()).not.toContain("Camille");
    expect(sentryExtras()[0]).toMatchObject({ recipientCount: 1, brevoCode: "unauthorized" });
  });

  it("ne remonte pas les paramètres d'un template quand l'envoi échoue", async () => {
    await sendTemplate("1234", {
      emailTo: [{ name: "Camille Martin", email: "camille@example.org" }],
      params: { cta: CTA, youngFirstName: "Camille", youngName: "Martin" },
    });

    expect((captureMessage as jest.Mock).mock.calls[0][0]).toBe("Error sending a template");
    expect(everythingReported()).not.toContain(TOKEN);
    expect(everythingReported()).not.toContain("Camille");
    expect(sentryExtras()[0]).toMatchObject({ templateId: 1234, recipientCount: 1, brevoCode: "unauthorized" });
  });

  it("ne remonte pas l'identité du jeune sur la branche « Parent sans email »", async () => {
    mockBrevoResponse({ message: "email is missing in to" });
    await sendTemplate(PARENT1_CONSENT, { emailTo: [], params: { cta: CTA, youngFirstName: "Camille", youngName: "Martin" } });

    expect((captureMessage as jest.Mock).mock.calls[0][0]).toBe("Parent sans email");
    expect(everythingReported()).not.toContain("Camille");
    expect(sentryExtras()[0]).toMatchObject({ templateId: Number(PARENT1_CONSENT), brevoMessage: "email is missing in to" });
  });

  it("ne remonte ni le numéro ni le texte d'un SMS qui échoue", async () => {
    await sendSMS("0612345678", "Votre code de validation SNU est 483921", "validation");

    expect((captureMessage as jest.Mock).mock.calls[0][0]).toBe("Error sending an SMS");
    expect(everythingReported()).not.toContain("483921");
    expect(everythingReported()).not.toContain("33612345678");
    expect(sentryExtras()[0]).toEqual({ tag: "validation", brevoCode: "unauthorized", brevoMessage: "Key not found" });
  });

  it("n'écrit pas le contenu des messages dans les logs d'un environnement déployé", async () => {
    mockConfig.ENVIRONMENT = "staging";
    mockBrevoResponse({ messageId: 1 });
    await sendTemplate("1234", { emailTo: [{ email: "camille@example.org" }], params: { cta: CTA, youngFirstName: "Camille" } });

    expect(everythingReported()).not.toContain(TOKEN);
    expect(everythingReported()).not.toContain("Camille");
  });

  it("garde le contenu complet dans les logs en développement local", async () => {
    mockConfig.ENVIRONMENT = "development";
    mockBrevoResponse({ messageId: 1 });
    await sendTemplate("1234", { emailTo: [{ email: "camille@example.org" }], params: { cta: CTA, youngFirstName: "Camille" } });

    expect(JSON.stringify((logger.debug as jest.Mock).mock.calls)).toContain(TOKEN);
  });

  it("n'écrit pas le corps de la requête dans les logs quand la clé Brevo est absente", async () => {
    mockConfig.SENDINBLUEKEY = "";
    await sendEmail({ name: "Camille Martin", email: "camille@example.org" } as any, "Consentement", HTML);

    expect(everythingReported()).not.toContain(TOKEN);
    expect(everythingReported()).not.toContain("Camille");
  });
});
