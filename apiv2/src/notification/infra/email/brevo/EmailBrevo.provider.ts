import * as brevo from "@getbrevo/brevo";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ReferentModel } from "@admin/core/iam/Referent.model";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { ContactProvider } from "../Contact.provider";
import { EmailProvider } from "../Email.provider";
import { EmailBrevoMapper } from "./EmailBrevo.mapper";

function setApiKey(apiInstance: brevo.TransactionalEmailsApi | brevo.ContactsApi, value: string) {
    //@ts-ignore
    let apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = value;
}
@Injectable()
export class EmailBrevoProvider implements EmailProvider, ContactProvider {
    emailsApi: brevo.TransactionalEmailsApi;
    contactsApi: brevo.ContactsApi;

    constructor(private readonly config: ConfigService) {
        let apiKey = this.config.getOrThrow("email.apiKey");

        this.emailsApi = new brevo.TransactionalEmailsApi();
        setApiKey(this.emailsApi, apiKey);

        this.contactsApi = new brevo.ContactsApi();
        setApiKey(this.contactsApi, apiKey);
    }

    async send(template: EmailTemplate, emailParams: EmailParams): Promise<{ response: object; body: object }> {
        const brevoParams = EmailBrevoMapper.mapEmailParamsToBrevoByTemplate(template, emailParams);
        let sendSmtpEmail = new brevo.SendSmtpEmail();

        const smtpEmailWithData = { ...brevoParams, ...sendSmtpEmail };

        return await this.emailsApi.sendTransacEmail(smtpEmailWithData);
    }

    async syncJeune(jeune): Promise<ConsumerResponse> {
        const updateContact = new brevo.UpdateContact();
        // TODO : add properties
        updateContact.attributes = {};
        // TODO : Create or update
        this.contactsApi.updateContact(jeune.id, updateContact);
        // OR
        this.contactsApi.createContact(updateContact);

        // TODO : ajouter référents légaux
        return ConsumerResponse.SUCCESS;
    }

    async syncReferent(referent: ReferentModel): Promise<ConsumerResponse> {
        // TODO : implement syncContact
        return ConsumerResponse.SUCCESS;
    }
}

export interface Recipient {
    email: string;
    name?: string;
}

// TODO : ajouter les pièces jointes
export type EmailProviderParams = {
    subject?: string;
    templateId: number;
    sender?: { name?: string; email: string };
    to: Recipient[];
    cc?: Recipient[];
    bcc?: Recipient[];
    replyTo?: { email: string; name?: string };
    headers?: { [key: string]: string };
    params?: { [key: string]: string };
};
