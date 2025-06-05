import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { Job } from "bullmq";
import { EmailParams, EmailTemplate } from "../../core/Notification";
import { QueueName } from "@shared/infra/Queue";
import { EmailProvider } from "./Email.provider";

type EmailTemplateData = EmailTemplate | string;

@Processor(QueueName.EMAIL)
export class EmailConsumer extends WorkerHost {
    constructor(
        private logger: Logger,
        @Inject(EmailProvider) private readonly emailProvider: EmailProvider,
    ) {
        super();
    }
    async process(
        job: Job<EmailParams & { __emailType?: "template" | "default" }, any, EmailTemplateData>,
    ): Promise<ConsumerResponse> {
        this.logger.log(`Sending email template "${job.name}" to ${JSON.stringify(job.data?.to)}`, EmailConsumer.name);

        const { __emailType, ...emailParams } = job.data;

        const emailPromise =
            __emailType === "template"
                ? this.emailProvider.send(job.name as EmailTemplate, emailParams)
                : this.emailProvider.sendDefault(job.name, emailParams);

        return emailPromise
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
