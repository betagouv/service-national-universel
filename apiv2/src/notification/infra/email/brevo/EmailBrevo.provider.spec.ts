/**
 * PL14 (lot P32, audit du 25/09/2026) : send() dumpait `emailParams` en entier via console.log,
 * hors Logger Nest et hors toute redaction — e-mails et noms des destinataires, et pour les
 * invitations REFERENT_CLASSE l'URL d'invitation avec son jeton, en clair dans les logs du worker.
 */
import { EmailBrevoProvider } from "./EmailBrevo.provider";
import { EmailTemplate } from "@notification/core/Notification";

jest.mock("@getbrevo/brevo", () => ({
    TransactionalEmailsApi: jest.fn().mockImplementation(() => ({
        authentications: { apiKey: {} },
        sendTransacEmail: jest.fn().mockResolvedValue({ response: {}, body: {} }),
    })),
    ContactsApi: jest.fn().mockImplementation(() => ({ authentications: { apiKey: {} } })),
    SendSmtpEmail: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("./EmailBrevo.mapper", () => ({
    EmailBrevoMapper: { mapEmailParamsToBrevoByTemplate: jest.fn().mockReturnValue({}) },
}));

describe("EmailBrevoProvider.send", () => {
    const configService = { getOrThrow: jest.fn().mockReturnValue("api-key") };
    const fileGateway = { downloadFile: jest.fn() };
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
    });

    it("n'écrit jamais les destinataires ni un lien porteur de jeton sur stdout", async () => {
        const provider = new EmailBrevoProvider(configService as any, fileGateway as any);
        const emailParams = {
            to: [{ email: "referent@example.org", name: "Jean Dupont" }],
            subject: "Invitation",
            invitationUrl: "https://admin.snu.gouv.fr/creer-mon-compte?invitationToken=secret-token-1234",
        };

        await provider.send(EmailTemplate.ENVOYER_MAIL_TEST, emailParams as any);

        expect(consoleLogSpy).not.toHaveBeenCalled();
    });
});
