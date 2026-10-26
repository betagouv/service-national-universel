import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { ContactType } from "../Notification";
import { ReferentSyncDto } from "./Contact";
import { ContactConsumer } from "./Contact.consumer";
import { ContactProvider } from "./Contact.provider";

describe("ContactConsumer - journaux (GOO-158, PL14)", () => {
    const referent = {
        id: "referent-1",
        email: "referent@example.org",
        operation: "UPDATE",
    } as unknown as ReferentSyncDto;
    let logger: Logger;
    let provider: jest.Mocked<ContactProvider>;
    let consumer: ContactConsumer;
    let logSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    const job = () =>
        ({ name: ContactType.REFERENT, data: [referent] }) as unknown as Job<ReferentSyncDto[], any, ContactType>;

    beforeEach(() => {
        logger = new Logger();
        logSpy = jest.spyOn(logger, "log").mockImplementation(() => undefined);
        errorSpy = jest.spyOn(logger, "error").mockImplementation(() => undefined);
        provider = { syncReferent: jest.fn().mockResolvedValue(undefined) } as unknown as jest.Mocked<ContactProvider>;
        consumer = new ContactConsumer(logger, provider);
    });

    it("ne journalise pas l'email du référent synchronisé", async () => {
        const resultat = await consumer.process(job());

        expect(resultat).toBe(ConsumerResponse.SUCCESS);
        expect(provider.syncReferent).toHaveBeenCalledWith(referent);
        const journal = JSON.stringify(logSpy.mock.calls);
        expect(journal).not.toContain("referent@example.org");
        expect(journal).toContain("referent-1");
    });

    it("ne journalise pas l'email en cas d'échec de synchronisation", async () => {
        provider.syncReferent.mockRejectedValue(
            Object.assign(new Error("echec"), { email: "referent@example.org", code: "E1" }),
        );

        await expect(consumer.process(job())).rejects.toBe(ConsumerResponse.FAILURE);

        expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("referent@example.org");
    });
});
