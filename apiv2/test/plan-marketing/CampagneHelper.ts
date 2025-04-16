import { CampagneModel, CreateCampagneGeneriqueModel } from "@plan-marketing/core/Campagne.model";
import { getPlanMarketingTestModuleRef } from "./setUpPlanMarketingTest";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";

export async function createCampagne(data: Partial<CampagneModel>): Promise<CampagneModel> {
    const planMarketingTestModule = getPlanMarketingTestModuleRef();
    const campagneGateway = planMarketingTestModule.get<CampagneGateway>(CampagneGateway);

    const defaultCampagne: CreateCampagneGeneriqueModel = {
        nom: "Test Campaign",
        objet: "Test Subject",
        templateId: 1,
        generic: true,
        destinataires: [],
        isProgrammationActive: false,
        programmations: [],
        ...data as any,
    };

    return campagneGateway.save(defaultCampagne);
}
