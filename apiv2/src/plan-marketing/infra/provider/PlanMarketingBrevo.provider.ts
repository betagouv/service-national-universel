import * as brevo from "@getbrevo/brevo";
import { Injectable } from "@nestjs/common";
import { PlanMarketingGateway } from "../../core/gateway/PlanMarketing.gateway";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PlanMarketingBrevoProvider implements PlanMarketingGateway {
    contactsApi: brevo.ContactsApi;

    constructor(private readonly config: ConfigService) {
        let apiKey = this.config.getOrThrow("email.apiKey");

        this.contactsApi = new brevo.ContactsApi();
        this.setApiKey(this.contactsApi, apiKey);
    }

    async importerContacts(nomListe: string, contacts: any): Promise<number> {
        const requestContactImport = new brevo.RequestContactImport();
        requestContactImport.fileBody = contacts;
        requestContactImport.newList = { listName: nomListe };
        requestContactImport.emailBlacklist = false;
        requestContactImport.smsBlacklist = false;
        requestContactImport.updateExistingContacts = true;
        requestContactImport.emptyContactsAttributes = false;

        try {
            const result = await this.contactsApi.importContacts(requestContactImport);
            return result.body.processId;
        } catch (error: any) {
            throw new Error(`Failed to import contacts: ${error.message}`);
        }
    }

    //TODO: finir updateCampagne
    updateCampagne(nomListe: string, campagneId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private setApiKey(apiInstance: brevo.ContactsApi, value: string) {
        //@ts-ignore
        let apiKey = apiInstance.authentications["apiKey"];
        apiKey.apiKey = value;
    }
}
