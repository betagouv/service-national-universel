import { Injectable, Logger } from "@nestjs/common";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { ContactProvider } from "../Contact.provider";
import { EmailProvider } from "../Email.provider";

@Injectable()
export class EmailBrevoMockProvider implements EmailProvider, ContactProvider {
    constructor() {}

    // TODO : build template, then send to mailCatcher
    async send(template: EmailTemplate, emailParams: EmailParams): Promise<{ response: object; body: object }> {
        return new Promise((resolve, reject) => {
            resolve({
                response: {},
                body: {
                    message: "Email sent successfully (local mock)",
                },
            });
        });
    }

    async sendDefault(template: string, emailParams: EmailParams): Promise<{ response: object; body: object }> {
        return new Promise((resolve, reject) => {
            resolve({
                response: {},
                body: {
                    message: "Email sent successfully (local mock)",
                },
            });
        });
    }

    async syncJeune(jeune): Promise<ConsumerResponse> {
        return ConsumerResponse.SUCCESS;
    }

    async syncReferent(referent: ReferentModel): Promise<ConsumerResponse> {
        return ConsumerResponse.SUCCESS;
    }
}
