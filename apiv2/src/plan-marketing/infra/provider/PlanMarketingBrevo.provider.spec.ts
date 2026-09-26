/**
 * PL16 (lot P32, audit du 25/09/2026) : importerContacts() journalisait notifyUrl en clair, qui
 * porte le jeton statique du webhook Brevo (HMAC du JWT_SECRET, PlanMarketingWebhook.service.ts).
 */
import { PlanMarketingBrevoProvider } from "./PlanMarketingBrevo.provider";

jest.mock("@getbrevo/brevo", () => ({
    ContactsApi: jest.fn().mockImplementation(() => ({
        authentications: { apiKey: {} },
        importContacts: jest.fn().mockResolvedValue({ body: { processId: 1 } }),
    })),
    EmailCampaignsApi: jest.fn().mockImplementation(() => ({ authentications: { apiKey: {} } })),
    TransactionalEmailsApi: jest.fn().mockImplementation(() => ({ authentications: { apiKey: {} } })),
    RequestContactImport: jest.fn().mockImplementation(() => ({})),
}));

describe("PlanMarketingBrevoProvider.importerContacts", () => {
    const configService = { getOrThrow: jest.fn().mockReturnValue("api-key") };

    it("ne journalise jamais le jeton porté par notifyUrl", async () => {
        const logSpy = jest.spyOn(require("@nestjs/common").Logger.prototype, "log").mockImplementation();
        const provider = new PlanMarketingBrevoProvider(configService as any);
        const token = "abcdef0123456789abcdef0123456789"; // gitleaks:allow (valeur factice de test)

        await provider.importerContacts("liste", "a,b", 1, `https://apiv2.snu.gouv.fr/plan-marketing/import/webhook?token=${token}`);

        const loggedMessages = logSpy.mock.calls.map((call) => call[0]);
        expect(loggedMessages.some((message) => String(message).includes(token))).toBe(false);
        logSpy.mockRestore();
    });
});
