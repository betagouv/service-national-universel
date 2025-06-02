import * as brevo from "@getbrevo/brevo";

import { ReferentModel } from "@admin/core/iam/Referent.model";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { EmailParams, EmailTemplate } from "@notification/core/Notification";
import { ConsumerResponse } from "@shared/infra/ConsumerResponse";
// import nodemailer from "nodemailer";
import * as nodemailer from "nodemailer";

import { ContactProvider } from "../Contact.provider";
import { EmailProvider } from "../Email.provider";
import { ConfigService } from "@nestjs/config";
import { GetSmtpTemplateOverview } from "@getbrevo/brevo";
import { EmailProviderParams } from "./EmailBrevo.provider";
import { EmailBrevoMapper } from "./EmailBrevo.mapper";
import Mail from "nodemailer/lib/mailer";
import { FileGateway } from "@shared/core/File.gateway";

@Injectable()
export class EmailBrevoCatcherProvider implements EmailProvider, ContactProvider {
    emailsApi: brevo.TransactionalEmailsApi;

    constructor(
        private readonly config: ConfigService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
    ) {
        const apiKeyConfig = this.config.getOrThrow("email.apiKey");
        this.emailsApi = new brevo.TransactionalEmailsApi();
        //@ts-ignore
        const apiKey = this.emailsApi.authentications["apiKey"];
        apiKey.apiKey = apiKeyConfig;
    }

    async send(template: EmailTemplate, emailParams: EmailParams): Promise<{ response: object; body: object }> {
        Logger.debug(
            `Sending email template "${template}" to ${JSON.stringify(emailParams.to)}`,
            EmailBrevoCatcherProvider.name,
        );
        const brevoParams = EmailBrevoMapper.mapEmailParamsToBrevoByTemplate(template, emailParams);
        const brevoHtmlTemplate = await this.findTemplateById(brevoParams.templateId);
        const subject = this.replaceTemplateParams(brevoHtmlTemplate.subject, brevoParams);
        const html = this.replaceTemplateParams(brevoHtmlTemplate.htmlContent, brevoParams);
        const transporter = nodemailer.createTransport({
            host: this.config.get("email.smtpHost"),
            port: Number(this.config.get("email.smtpPort")),
            secure: false,
        });
        const attachments: Mail.Attachment[] = [];
        if (emailParams.attachments && emailParams.attachments.length > 0) {
            for (const attachment of emailParams.attachments) {
                const file = await this.fileGateway.downloadFile(attachment.filePath);
                attachments.push({ content: file.Body, filename: file.FileName, contentType: file.ContentType });
            }
        }
        const mailOptions: Mail.Options = {
            to: brevoParams.to.map((to) => to.email).join(","),
            cc: brevoParams.cc?.map((cc) => cc.email).join(","),
            bcc: brevoParams.bcc?.map((bcc) => bcc.email).join(","),
            subject,
            html,
            attachments,
        };
        const messageSent = await transporter.sendMail(mailOptions);
        return {
            response: { response: messageSent.response },
            body: { body: messageSent.response },
        };
    }

    private async findTemplateById(id: number): Promise<GetSmtpTemplateOverview> {
        const template = await this.emailsApi.getSmtpTemplate(id);
        return template.body;
    }

    private replaceTemplateParams(content: string, brevoParams: EmailProviderParams) {
        const params = brevoParams.params;
        if (!params) {
            return content;
        }
        let hydratedContent = content;
        for (const paramKey of Object.keys(params)) {
            hydratedContent = hydratedContent.replace(
                new RegExp(`{{ *params.${paramKey} *}}`, "g"),
                String(params[paramKey]),
            );
        }
        return hydratedContent;
    }

    async syncJeune(jeune): Promise<ConsumerResponse> {
        return ConsumerResponse.SUCCESS;
    }

    async syncReferent(referent: ReferentModel): Promise<ConsumerResponse> {
        return ConsumerResponse.SUCCESS;
    }
}
