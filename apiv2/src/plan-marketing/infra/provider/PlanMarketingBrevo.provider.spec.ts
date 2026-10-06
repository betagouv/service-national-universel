import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PlanMarketingBrevoProvider } from "./PlanMarketingBrevo.provider";

const JETON_FACTICE = "jeton-factice-0123456789abcdef";

describe("PlanMarketingBrevoProvider - journaux (GOO-158)", () => {
    let provider: PlanMarketingBrevoProvider;
    let logSpy: jest.SpyInstance;

    beforeEach(() => {
        const config = { getOrThrow: jest.fn().mockReturnValue("cle-factice") } as unknown as ConfigService;
        provider = new PlanMarketingBrevoProvider(config);
        provider.contactsApi.importContacts = jest.fn().mockResolvedValue({ body: { processId: 42 } });
        logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    });

    afterEach(() => {
        logSpy.mockRestore();
    });

    it("importerContacts ne journalise pas le jeton de l'URL de notification", async () => {
        const notifyUrl = `https://api.example.org/v2/plan-marketing/import/webhook?token=${JETON_FACTICE}`;

        const processId = await provider.importerContacts("Liste", "email\na@example.org", 12, notifyUrl);

        expect(processId).toBe(42);
        expect(logSpy).toHaveBeenCalled();
        expect(JSON.stringify(logSpy.mock.calls)).not.toContain(JETON_FACTICE);
    });

    it("transmet quand même l'URL de notification complète à Brevo", async () => {
        const notifyUrl = `https://api.example.org/v2/plan-marketing/import/webhook?token=${JETON_FACTICE}`;

        await provider.importerContacts("Liste", "email\na@example.org", 12, notifyUrl);

        expect((provider.contactsApi.importContacts as jest.Mock).mock.calls[0][0].notifyUrl).toBe(notifyUrl);
    });
});
