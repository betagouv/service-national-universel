import { EmailParams, EmailTemplate } from "@notification/core/Notification";

export interface EmailProvider {
    send(template: EmailTemplate, emailParams: EmailParams): Promise<{ response: object; body: object }>;
}

export const EmailProvider = Symbol("EmailProvider");
