import { EmailTemplate } from "./Notification";

export interface NotificationGateway {
    sendEmail<T>(params: T, template: EmailTemplate | string): Promise<void>;
}

export const NotificationGateway = Symbol("NotificationGateway");
