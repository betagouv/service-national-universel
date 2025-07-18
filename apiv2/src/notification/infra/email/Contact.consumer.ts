import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { QueueName } from "@shared/infra/Queue";
import { Job } from "bullmq";
import { ContactType } from "../Notification";
import { ReferentSyncDto } from "./Contact";
import { ContactProvider } from "./Contact.provider";
import { SentryExceptionCaptured } from "@sentry/nestjs";

@Processor(QueueName.CONTACT)
export class ContactConsumer extends WorkerHost {
    constructor(
        private logger: Logger,
        @Inject(ContactProvider) private readonly contactProvider: ContactProvider,
    ) {
        super();
    }

    @SentryExceptionCaptured()
    async process(job: Job<ReferentSyncDto[], any, ContactType>): Promise<ConsumerResponse> {
        try {
            switch (job.name) {
                case ContactType.JEUNE: {
                    for (const jeune of job.data) {
                        this.logger.log(`Synchronizing JeuneId: ${jeune.id}`, ContactConsumer.name);
                        await this.contactProvider.syncJeune(jeune);
                    }
                    break;
                }
                case ContactType.REFERENT: {
                    for (const referent of job.data) {
                        this.logger.log(
                            `Synchronizing referent: ${referent.email} - ${referent.id} - ${referent.operation}`,
                            ContactConsumer.name,
                        );
                        await this.contactProvider.syncReferent(referent);
                    }
                    break;
                }
                default: {
                    throw new Error(`Unknown contact type ${job.name}`);
                }
            }
            return ConsumerResponse.SUCCESS;
        } catch (error: any) {
            this.logger.error(
                `Error synchronizing user type ${job.name} for email ${error.email} - ${error.code} - ${error.message}`,
                ContactConsumer.name,
            );
            throw ConsumerResponse.FAILURE;
        }
    }
}
