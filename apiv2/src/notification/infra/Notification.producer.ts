import { Injectable } from "@nestjs/common";
import { NotificationGateway } from "../core/Notification.gateway";
import { EmailTemplate } from "../core/Notification";
import { InjectQueue } from "@nestjs/bullmq";
import { QueueType } from "./Notification";
import { Queue } from "bullmq";

@Injectable()
export class NotificationProducer implements NotificationGateway {
    constructor(@InjectQueue(QueueType.EMAIL) private emailQueue: Queue) {}
    async sendEmail<T>(params: T, template: EmailTemplate): Promise<void> {
        await this.emailQueue.add(template, params);
    }
}
