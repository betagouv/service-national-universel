import { Injectable, Logger } from "@nestjs/common";
import { PlanMarketingGateway } from "../../core/gateway/PlanMarketing.gateway";

@Injectable()
export class PlanMarketingMockProvider implements PlanMarketingGateway {
    findCampagneById(campagneId: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve({ id: 42 });
        });
    }
    importerContacts(nomListe: string, contacts: any, folderId: number, notifyUrl: string): Promise<number> {
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
}
