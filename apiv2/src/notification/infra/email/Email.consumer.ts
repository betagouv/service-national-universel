import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { Job } from "bullmq";
import { EmailParams, EmailTemplate } from "../../core/Notification";
import { QueueName } from "@shared/infra/Queue";
import { EmailProvider } from "./Email.provider";

@Processor(QueueName.EMAIL)
export class EmailConsumer extends WorkerHost {
    constructor(
        private logger: Logger,
        @Inject(EmailProvider) private readonly emailProvider: EmailProvider,
    ) {
        super();
    }
    async process(job: Job<EmailParams, any, EmailTemplate>): Promise<ConsumerResponse> {
        this.logger.log(`Sending email template "${job.name}" to ${JSON.stringify(job.data)}`, EmailConsumer.name);
        return this.emailProvider
            .send(job.name, job.data)
            .then(() => {
                this.logger.log(`Email template "${job.name}" sent to ${JSON.stringify(job.data)}`, EmailConsumer.name);
                return ConsumerResponse.SUCCESS;
            })
            .catch((error) => {
                this.logger.error(
                    `Error sending email template "${job.name}" - ${error.message} - ${error.stack}`,
                    EmailConsumer.name,
                );
                throw error;
            });
    }
}
