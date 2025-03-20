import { Injectable, Logger } from "@nestjs/common";
import { PlanMarketingCampagne, PlanMarketingGateway } from "../../core/gateway/PlanMarketing.gateway";

@Injectable()
export class PlanMarketingMockProvider implements PlanMarketingGateway {
    sendCampagneNow(campagneId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
    createCampagne(campagne: PlanMarketingCampagne): Promise<Pick<PlanMarketingCampagne, "id">> {
        return new Promise((resolve, reject) => {
            resolve(campagne);
        });
    }
    findTemplateById(templateId: number): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            resolve("template42");
        });
    }

    findCampagneById(campagneId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve({ id: 42 });
        });
    }
    importerContacts(nomListe: string, contacts: string, folderId: number, notifyUrl: string): Promise<number> {
        Logger.log(`[MOCK] Importing contacts to liste diffusion: ${nomListe}`, "PlanMarketingMockProvider");

        return new Promise((resolve, reject) => {
            resolve(0);
        });
    }
    updateCampagne(nomListe: string, campagneId: string): Promise<void> {
        Logger.log(`[MOCK] Updating campagne: ${campagneId}`, "PlanMarketingMockProvider");

        return new Promise((resolve, reject) => {
            resolve();
        });
    }
    async creerListeDiffusion(nom: string): Promise<void> {
        Logger.log(`[MOCK] Creating liste diffusion with name: ${nom}`, "PlanMarketingMockProvider");
    }

    async deleteOldestListeDiffusion(): Promise<void> {
        Logger.log(`[MOCK] Deleting oldest liste diffusion`, "PlanMarketingMockProvider");
    }
}
