import * as brevo from "@getbrevo/brevo";
import { Injectable, Logger } from "@nestjs/common";
import { PlanMarketingCampagne, PlanMarketingGateway } from "../../core/gateway/PlanMarketing.gateway";
import { ConfigService } from "@nestjs/config";
import { TechnicalException, TechnicalExceptionType } from "@shared/infra/TechnicalException";

@Injectable()
export class PlanMarketingBrevoProvider implements PlanMarketingGateway {
    contactsApi: brevo.ContactsApi;
    campaignsApi: brevo.EmailCampaignsApi;
    emailsApi: brevo.TransactionalEmailsApi;

    private readonly logger = new Logger(PlanMarketingBrevoProvider.name);

    constructor(private readonly config: ConfigService) {
        const apiKey = this.config.getOrThrow("email.apiKey");

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

    async importerContacts(nomListe: string, contacts: string, folderId: number, notifyUrl: string): Promise<number> {
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

    async createCampagne(campagne: PlanMarketingCampagne): Promise<Pick<PlanMarketingCampagne, "id">> {
        this.logger.log(`createCampagne() - campagne: ${campagne.name}`);
        try {
            const createEmailCampaign: brevo.CreateEmailCampaign = {
                name: campagne.name,
                sender: campagne.sender,
                templateId: campagne.templateId,
                subject: campagne.subject,
                recipients: campagne.recipients,
            };

            return (await this.campaignsApi.createEmailCampaign(createEmailCampaign)).body;
        } catch (error: any) {
            this.logger.error(`Failed to create campaign:${JSON.stringify(error.body)}`);
            throw new TechnicalException(TechnicalExceptionType.BREVO, `Failed to create campaign: ${error.message}`);
        }
    }

    async sendCampagneNow(campagneId: string): Promise<void> {
        this.logger.log(`sendCampagne() - campagne: ${campagneId}`);
        try {
            await this.campaignsApi.sendEmailCampaignNow(parseInt(campagneId));
            return Promise.resolve();
        } catch (error: any) {
            this.logger.error(`Failed to send campaign:${JSON.stringify(error.body)}`);
            throw new TechnicalException(TechnicalExceptionType.BREVO, `Failed to send campaign: ${error.message}`);
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

    async deleteOldestListeDiffusion(): Promise<void> {
        const folderIdToExclude = 589;
        try {
            // 1. Récupérer toutes les listes
            const listsResponse = await this.contactsApi.getLists(undefined, undefined, "asc");
            const listeDiffusions = listsResponse.body.lists;
            if (!listeDiffusions || listeDiffusions.length === 0) {
                this.logger.log("Aucune liste trouvée.");
                return;
            }

            // 2. Exclure le dossier "DEV - Ne Pas Supprimer - WARNING"
            const filteredListsDiffusion = listeDiffusions.filter((list) => list.folderId !== folderIdToExclude);
            if (filteredListsDiffusion.length === 0) {
                this.logger.log("Aucune liste à supprimer.");
                return;
            }

            // 3. Supprimer la plus ancienne liste
            const oldestListDiffusion = filteredListsDiffusion[0];
            this.logger.log(
                `Suppression de la liste la plus ancienne : ${oldestListDiffusion.name} (ID: ${oldestListDiffusion.id})`,
            );
            await this.contactsApi.deleteList(oldestListDiffusion.id);
            this.logger.log(`Liste supprimée avec succès : ${oldestListDiffusion.name}`);
        } catch (error: any) {
            throw new TechnicalException(
                TechnicalExceptionType.BREVO,
                `Erreur lors de la suppression de la liste: ${error.message}`,
            );
        }
    }

    private setApiKey(
        apiInstance: brevo.ContactsApi | brevo.EmailCampaignsApi | brevo.TransactionalEmailsApi,
        value: string,
    ) {
        //@ts-ignore
        const apiKey = apiInstance.authentications["apiKey"];
        apiKey.apiKey = value;
    }
}
