import { CampagneModel, CreateCampagneModel } from "@plan-marketing/core/Campagne.model";
import { getPlanMarketingTestModuleRef } from "./setUpPlanMarketingTest";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";

export async function createCampagne(data: Partial<CreateCampagneModel>): Promise<CampagneModel> {
    const planMarketingTestModule = getPlanMarketingTestModuleRef();
    const campagneGateway = planMarketingTestModule.get<CampagneGateway>(CampagneGateway);
    const defaultCampagne: Partial<CreateCampagneModel> = {
        nom: "Test Campaign",
        objet: "Test Subject",
        templateId: 1,
        generic: true,
        destinataires: [],
        isProgrammationActive: false,
        programmations: [],
        ...(data as any),
    };

    return campagneGateway.save(defaultCampagne as CreateCampagneModel);
}
