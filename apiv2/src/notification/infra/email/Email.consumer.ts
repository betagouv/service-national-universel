import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { Job } from "bullmq";
import { EmailParams, EmailTemplate } from "../../core/Notification";
import { QueueName } from "@shared/infra/Queue";
import { EmailProvider } from "./Email.provider";
import { SentryExceptionCaptured } from "@sentry/nestjs";

@Processor(QueueName.EMAIL)
export class EmailConsumer extends WorkerHost {
    constructor(
        private logger: Logger,
        @Inject(EmailProvider) private readonly emailProvider: EmailProvider,
    ) {
        super();
    }

    @SentryExceptionCaptured()
    async process(job: Job<EmailParams, any, EmailTemplate>): Promise<ConsumerResponse> {
        this.logger.log(`Sending email template "${job.name}" to ${JSON.stringify(job.data?.to)}`, EmailConsumer.name);
        return this.emailProvider
            .send(job.name, job.data)
            .then(() => {
                return ConsumerResponse.SUCCESS;
            })
            .catch((error) => {
                this.logger.error(
                    `Error sending email template "${job.name}" - ${error.message} - ${
                        error.statusCode
                    } - ${JSON.stringify(error.body)} ${error.stack}`,
                    EmailConsumer.name,
                );
                throw error;
            });
    }
}
