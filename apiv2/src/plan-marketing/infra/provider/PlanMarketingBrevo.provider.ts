import * as brevo from "@getbrevo/brevo";
import { Injectable, Logger } from "@nestjs/common";
import { PlanMarketingGateway } from "../../core/gateway/PlanMarketing.gateway";
import { ConfigService } from "@nestjs/config";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";

@Injectable()
export class PlanMarketingBrevoProvider implements PlanMarketingGateway {
    contactsApi: brevo.ContactsApi;
    campaignsApi: brevo.EmailCampaignsApi;
    emailsApi: brevo.TransactionalEmailsApi;

    private readonly logger = new Logger(PlanMarketingBrevoProvider.name);

    constructor(private readonly config: ConfigService) {
        let apiKey = this.config.getOrThrow("email.apiKey");

        this.contactsApi = new brevo.ContactsApi();
        this.campaignsApi = new brevo.EmailCampaignsApi();
        this.emailsApi = new brevo.TransactionalEmailsApi();

        this.setApiKey(this.contactsApi, apiKey);
        this.setApiKey(this.campaignsApi, apiKey);
        this.setApiKey(this.emailsApi, apiKey);
    }

    async findTemplateById(templateId: number): Promise<string | undefined> {
        this.logger.log(`findTemplateById() - templateId: ${templateId}`);
        try {
            const result = await this.emailsApi.getSmtpTemplate(templateId);
            return result.body.htmlContent;
        } catch (error: any) {
            this.logger.error(`Failed to find template:${JSON.stringify(error.body)}`);
        }
    }

    async getAllCampagnes(): Promise<any[]> {
        this.logger.log(`getAllCampagnes()`);
        try {
            const result = await this.campaignsApi.getEmailCampaigns();
            return result.body.campaigns || [];
        } catch (error: any) {
            this.logger.error(`Failed to get all campaigns:${JSON.stringify(error.body)}`);
            return [];
        }
    }

    // TODO : add type when model of campagne is available
    async findCampagneById(campagneId: string): Promise<any> {
        this.logger.log(`findCampagneById() - campagneId: ${campagneId}`);
        try {
            const result = await this.campaignsApi.getEmailCampaign(parseInt(campagneId));
            return result.body;
        } catch (error: any) {
            this.logger.error(`Failed to find campaign:${JSON.stringify(error.body)}`);
        }
    }

    async importerContacts(nomListe: string, contacts: any, folderId: number, notifyUrl: string): Promise<number> {
        this.logger.log(`importerContacts() - nomListe: ${nomListe}, notifyUrl: ${notifyUrl}`);
        const requestContactImport = new brevo.RequestContactImport();
        requestContactImport.fileBody = contacts;
        requestContactImport.newList = { listName: nomListe, folderId: folderId };
        requestContactImport.updateExistingContacts = true;
        requestContactImport.emptyContactsAttributes = false;
        requestContactImport.notifyUrl = notifyUrl;

        try {
            const result = await this.contactsApi.importContacts(requestContactImport);
            return result.body.processId;
        } catch (error: any) {
            this.logger.error(`Failed to import contacts:${JSON.stringify(error.body)}`);
            throw new TechnicalException(TechnicalExceptionType.BREVO, `Failed to import contacts: ${error.message}`);
        }
    }

    async updateCampagne(nomListe: string, campagneId: string): Promise<void> {
        this.logger.log(`updateCampagne() - nomListe: ${nomListe}, campagneId: ${campagneId}`);
        try {
            const lists = await this.contactsApi.getLists();
            const list = lists.body.lists?.find((liste) => liste.name === nomListe);
            if (!list?.id) {
                throw new TechnicalException(TechnicalExceptionType.BREVO, `List ${nomListe} not found`);
            }

            const updateEmailCampaign: brevo.UpdateEmailCampaign = {
                sender: { name: "Service National Universel", email: "no_reply@snu.gouv.fr" },
                recipients: { listIds: [list.id] },
            };

            await this.campaignsApi.updateEmailCampaign(parseInt(campagneId), updateEmailCampaign);
        } catch (error: any) {
            this.logger.error(`Failed to update campaign:${JSON.stringify(error.body)}`);
            throw new TechnicalException(TechnicalExceptionType.BREVO, `Failed to update campaign: ${error.message}`);
        }
    }

    private setApiKey(
        apiInstance: brevo.ContactsApi | brevo.EmailCampaignsApi | brevo.TransactionalEmailsApi,
        value: string,
    ) {
        //@ts-ignore
        let apiKey = apiInstance.authentications["apiKey"];
        apiKey.apiKey = value;
    }
}
