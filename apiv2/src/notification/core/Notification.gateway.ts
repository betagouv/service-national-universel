import { EmailTemplate } from "./Notification";

export interface NotificationGateway {
    sendEmail<T>(params: T, template: EmailTemplate): Promise<void>;
    sendDefaultEmail<T>(params: T, template: string): Promise<void>;
}

export const NotificationGateway = Symbol("NotificationGateway");
