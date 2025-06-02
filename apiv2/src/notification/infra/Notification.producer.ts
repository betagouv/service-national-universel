import { Injectable, Logger } from "@nestjs/common";
import { NotificationGateway } from "../core/Notification.gateway";
import { EmailTemplate } from "../core/Notification";
import { InjectQueue } from "@nestjs/bullmq";
import { QueueName } from "@shared/infra/Queue";
import { Queue } from "bullmq";

@Injectable()
export class NotificationProducer implements NotificationGateway {
    constructor(@InjectQueue(QueueName.EMAIL) private emailQueue: Queue) {}
    async sendEmail<T>(params: T, template: EmailTemplate | string): Promise<void> {
        Logger.debug(`Add to queue : params: ${JSON.stringify(params)}, template: ${template}`, "NotificationProducer");
        await this.emailQueue.add(template, params);
    }
}
