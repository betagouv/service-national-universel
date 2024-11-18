import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { ReferentModel } from "src/admin/core/iam/Referent.model";
import { ContactType } from "../Notification";
import { QueueName } from "@shared/infra/Queue";
import { ContactProvider } from "./Contact.provider";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";

@Processor(QueueName.CONTACT)
export class ContactConsumer extends WorkerHost {
    constructor(
        private logger: Logger,
        @Inject(ContactProvider) private readonly contactProvider: ContactProvider,
    ) {
        super();
    }
    async process(job: Job<ReferentModel[], any, ContactType>): Promise<ConsumerResponse> {
        try {
            switch (job.name) {
                case ContactType.JEUNE: {
                    for (const jeune of job.data) {
                        this.logger.log(`Synchronizing JeuneId: ${jeune.id}`);
                        await this.contactProvider.syncJeune(jeune);
                    }
                    break;
                }
                case ContactType.REFERENT: {
                    for (const referent of job.data) {
                        this.logger.log(`Synchronizing ReferentId: ${referent.id}`);
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
                `Error synchronizing user of type: "${job.name}" - ${error.message} - ${error.stack}`,
                ContactConsumer.name,
            );
            throw error;
        }
    }
}
