import * as net from "net";
import { ConfigService } from "@nestjs/config";
import { EmailTemplate, ExportDownloadParams } from "@notification/core/Notification";
import { EmailBrevoCatcherProvider } from "./EmailBrevoCatcher.provider";

// Non-régression GOO-177 (nodemailer ^9.1.1 -> ^10.0.9) : seul test qui exerce le vrai
// transport SMTP de nodemailer sur ce provider (createTransport + sendMail). getSmtpTemplate
// (Brevo) est mocké, hors périmètre de ce ticket.
describe("EmailBrevoCatcherProvider.send (transport SMTP réel de nodemailer)", () => {
    let server: net.Server;
    let receivedData = "";

    beforeEach(() => {
        receivedData = "";
        let buffer = "";
        let inData = false;
        server = net.createServer((socket) => {
            socket.write("220 localhost ESMTP\r\n");
            socket.on("data", (chunk) => {
                buffer += chunk.toString();
                if (inData) {
                    if (buffer.endsWith("\r\n.\r\n")) {
                        receivedData += buffer.slice(0, -5);
                        inData = false;
                        buffer = "";
                        socket.write("250 OK: message accepted\r\n");
                    }
                    return;
                }
                const lines = buffer.split("\r\n").filter(Boolean);
                buffer = "";
                for (const line of lines) {
                    if (/^EHLO/i.test(line)) {
                        socket.write("250-localhost\r\n250 OK\r\n");
                    } else if (/^MAIL FROM/i.test(line)) {
                        socket.write("250 OK\r\n");
                    } else if (/^RCPT TO/i.test(line)) {
                        socket.write("250 OK\r\n");
                    } else if (/^DATA/i.test(line)) {
                        inData = true;
                        socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
                    } else if (/^QUIT/i.test(line)) {
                        socket.write("221 Bye\r\n");
                        socket.end();
                    }
                }
            });
        });
        return new Promise<void>((resolve) => {
            server.listen(0, "127.0.0.1", () => resolve());
        });
    });

    afterEach(() => {
        return new Promise<void>((resolve) => {
            server.close(() => resolve());
        });
    });

    it("envoie un email sans erreur ; le serveur SMTP reçoit le sujet et le destinataire attendus", async () => {
        const { port } = server.address() as net.AddressInfo;
        const config = {
            getOrThrow: jest.fn().mockReturnValue("fake-api-key"),
            get: jest.fn((key: string) => (key === "email.smtpHost" ? "127.0.0.1" : key === "email.smtpPort" ? port : undefined)),
        } as unknown as ConfigService;
        const fileGateway = {} as any;
        const provider = new EmailBrevoCatcherProvider(config, fileGateway);
        (provider as any).findTemplateById = jest.fn().mockResolvedValue({
            subject: "Sujet de test GOO-177",
            htmlContent: "<p>corps du message</p>",
        });

        const emailParams: ExportDownloadParams = {
            to: [{ email: "destinataire@example.org", name: "Destinataire" }],
            url: "https://example.com/export.csv",
        };
        const result = await provider.send(EmailTemplate.EXPORT_DOWNLOAD, emailParams);

        expect(result.response).toBeDefined();
        expect(receivedData).toContain("Sujet de test GOO-177");
        expect(receivedData).toContain("destinataire@example.org");
    });
});
