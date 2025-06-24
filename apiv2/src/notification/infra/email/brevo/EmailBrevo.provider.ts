import * as brevo from "@getbrevo/brevo";
import { CreateUpdateContactModel, SendSmtpEmail, SendSmtpEmailAttachmentInner } from "@getbrevo/brevo";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
import * as http from "http";
import { ROLES } from "snu-lib";
import { OperationType, ReferentSyncDto } from "../Contact";
import { ContactProvider, ContactProviderError } from "../Contact.provider";
import { EmailProvider } from "../Email.provider";
import { EmailBrevoMapper } from "./EmailBrevo.mapper";
import { FileGateway } from "@shared/core/File.gateway";

function setApiKey(apiInstance: brevo.TransactionalEmailsApi | brevo.ContactsApi, value: string) {
    //@ts-ignore
    const apiKey = apiInstance.authentications["apiKey"];
    apiKey.apiKey = value;
}
@Injectable()
export class EmailBrevoProvider implements EmailProvider, ContactProvider {
    emailsApi: brevo.TransactionalEmailsApi;
    contactsApi: brevo.ContactsApi;

    constructor(
        private readonly config: ConfigService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
    ) {
        const apiKey = this.config.getOrThrow("email.apiKey");

        this.emailsApi = new brevo.TransactionalEmailsApi();
        setApiKey(this.emailsApi, apiKey);

        this.contactsApi = new brevo.ContactsApi();
        setApiKey(this.contactsApi, apiKey);
    }

    async send(template: EmailTemplate, emailParams: EmailParams): Promise<{ response: object; body: object }> {
        console.log(EmailBrevoProvider.name, template, emailParams);
        const brevoParams = EmailBrevoMapper.mapEmailParamsToBrevoByTemplate(template, emailParams);
        const sendSmtpEmail = new brevo.SendSmtpEmail();

        const smtpEmailWithData: SendSmtpEmail = { ...brevoParams, ...sendSmtpEmail };

        if (emailParams.attachments && emailParams.attachments.length > 0) {
            const attachments: SendSmtpEmailAttachmentInner[] = [];
            for (const attachment of emailParams.attachments) {
                const file = await this.fileGateway.downloadFile(attachment.filePath);
                attachments.push({ content: file.Body.toString("base64"), name: file.FileName });
            }
            smtpEmailWithData.attachment = attachments;
        }

        return await this.emailsApi.sendTransacEmail(smtpEmailWithData);
    }

    async syncJeune(jeune): Promise<ConsumerResponse> {
        const updateContact = new brevo.UpdateContact();
        // TODO : add properties
        updateContact.attributes = {};
        // TODO : Create or update
        // this.contactsApi.updateContact(jeune.id, updateContact);
        // // OR
        // this.contactsApi.createContact(updateContact);

        // TODO : ajouter référents légaux
        throw ConsumerResponse.FAILURE;
    }

    async syncReferent(referent: ReferentSyncDto): Promise<ConsumerResponse> {
        try {
            if (referent.operation === OperationType.DELETE) {
                await this.contactsApi.deleteContact(referent.email);
                return ConsumerResponse.SUCCESS;
            }
            await this.createOrUpdateReferent(referent);
            return ConsumerResponse.SUCCESS;
        } catch (error: any) {
            const exception: ContactProviderError = {
                email: referent.email,
                code: error.body?.code,
                message: error.body?.message,
            };
            throw exception;
        }
    }

    private async createOrUpdateReferent(referent: ReferentSyncDto): Promise<{
        response: http.IncomingMessage;
        body: CreateUpdateContactModel;
    }> {
        // On utilise le post de Brevo pour créer et mettre à jour les contacts (code http: 201 et 204)
        const brevoContact = new brevo.CreateContact();
        brevoContact.email = referent.email;
        brevoContact.updateEnabled = true;
        const listIds = [1448];
        if (referent.role) {
            if ([ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(referent.role)) {
                listIds.push(1243, 2225);
            }
            if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(referent.role)) {
                listIds.push(1449);
            }
        }

        brevoContact.listIds = listIds;
        brevoContact.attributes = {
            PRENOM: referent.prenom,
            NOM: referent.nom,
            ROLE: referent.role,
            REGION: referent.region,
        };
        return this.contactsApi.createContact(brevoContact);
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
