import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { EmailParams, EmailTemplate } from "../../core/Notification";
import { EmailConsumer } from "./Email.consumer";
import { EmailProvider } from "./Email.provider";

describe("EmailConsumer - journaux (GOO-158, PL14)", () => {
    const destinataire = { email: "jean.dupont@example.org", name: "Jean Dupont" };
    let logger: Logger;
    let emailProvider: jest.Mocked<EmailProvider>;
    let consumer: EmailConsumer;
    let logSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    const job = (to = [destinataire]) =>
        ({ name: "template-test", data: { to } }) as unknown as Job<EmailParams, any, EmailTemplate>;

    beforeEach(() => {
        logger = new Logger();
        logSpy = jest.spyOn(logger, "log").mockImplementation(() => undefined);
        errorSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
        emailProvider = { send: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<EmailProvider>;
        consumer = new EmailConsumer(logger, emailProvider);
    });

    it("ne journalise ni adresse ni nom, seulement le template et le nombre de destinataires", async () => {
        const resultat = await consumer.process(job([destinataire, { email: "autre@example.org", name: "Autre" }]));

        expect(resultat).toBe(ConsumerResponse.SUCCESS);
        const journal = JSON.stringify(logSpy.mock.calls);
        expect(journal).not.toContain("jean.dupont@example.org");
        expect(journal).not.toContain("autre@example.org");
        expect(journal).not.toContain("Jean Dupont");
        expect(journal).toContain("template-test");
        expect(journal).toContain("2 recipient(s)");
    });

    it("ne journalise pas non plus les destinataires en cas d'échec d'envoi", async () => {
        emailProvider.send.mockRejectedValue(Object.assign(new Error("echec"), { statusCode: 500 }));

        await expect(consumer.process(job())).rejects.toThrow("echec");

        const journal = JSON.stringify([...logSpy.mock.calls, ...errorSpy.mock.calls]);
        expect(journal).not.toContain("jean.dupont@example.org");
        expect(journal).not.toContain("Jean Dupont");
    });
});
