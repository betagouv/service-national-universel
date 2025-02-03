import { Injectable, Logger } from "@nestjs/common";
import { PlanMarketingGateway } from "../../core/gateway/PlanMarketing.gateway";

@Injectable()
export class PlanMarketingMockProvider implements PlanMarketingGateway {
    async creerListeDiffusion(nom: string): Promise<void> {
        Logger.log(`[MOCK] Creating liste diffusion with name: ${nom}`, "PlanMarketingMockProvider");
    }
}
