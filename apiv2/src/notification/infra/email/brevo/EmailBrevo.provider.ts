import * as brevo from "@getbrevo/brevo";
import { Injectable, Logger } from "@nestjs/common";
import { ReferentModel } from "src/admin/core/iam/Referent.model";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import { ContactProvider } from "../Contact.provider";
import { EmailProvider } from "../Email.provider";
import { EmailBrevoMapper } from "./EmailBrevo.mapper";

@Injectable()
export class EmailBrevoProvider implements EmailProvider, ContactProvider {
    emailsApi: brevo.TransactionalEmailsApi;
    contactsApi: brevo.ContactsApi;

    constructor() {
        this.emailsApi = new brevo.TransactionalEmailsApi();
        this.contactsApi = new brevo.ContactsApi();
        //@ts-ignore
        let apiKey = this.emailsApi.authentications["apiKey"];
        // TODO : inject node-config key
        apiKey.apiKey = "";
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

export type EmailProviderParams = {
    subject?: string;
    templateId: number;
    sender?: { name?: string; email: string };
    to: Recipient[];
    replyTo?: { email: string; name?: string };
    headers?: { [key: string]: string };
    params?: { [key: string]: string };
};
