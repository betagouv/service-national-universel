import { ConfigService } from "@nestjs/config";
import { EmailTemplate, ExportDownloadParams } from "@notification/core/Notification";
import { EmailBrevoProvider } from "./EmailBrevo.provider";

// PL14 (audit du 25/09/2026) : `send` journalisait en clair, via console.log, le template et
// l'intégralité des paramètres de l'email (destinataires, variables de template) à chaque envoi.
describe("EmailBrevoProvider.send", () => {
    it("ne journalise jamais les paramètres de l'email dans la console", async () => {
        const config = { getOrThrow: jest.fn().mockReturnValue("fake-api-key") } as unknown as ConfigService;
        const fileGateway = {} as any;
        const provider = new EmailBrevoProvider(config, fileGateway);
        provider.emailsApi.sendTransacEmail = jest.fn().mockResolvedValue({ response: {}, body: {} });

        const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

        const emailParams: ExportDownloadParams = {
            to: [{ email: "jean.dupont@example.com", name: "Jean Dupont" }],
            url: "https://example.com/export.csv",
        };
        await provider.send(EmailTemplate.EXPORT_DOWNLOAD, emailParams);

        expect(consoleSpy).not.toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
