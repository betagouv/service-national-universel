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
    async process(job: Job<EmailParams, any, EmailTemplateData>): Promise<ConsumerResponse> {
        this.logger.log(`Sending email template "${job.name}" to ${JSON.stringify(job.data?.to)}`, EmailConsumer.name);

        const emailPromise = this.isEmailTemplate(job.name)
            ? this.emailProvider.send(job.name, job.data)
            : this.emailProvider.sendDefault(job.name, job.data);

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

    private isEmailTemplate(template: string): template is EmailTemplate {
        return Object.values(EmailTemplate).includes(template as EmailTemplate);
    }
}
