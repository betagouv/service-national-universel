import { CampagneModel } from "@plan-marketing/core/Campagne.model";
import { getPlanMarketingTestModuleRef } from "./setUpPlanMarketingTest";
import { CampagneGateway } from "@plan-marketing/core/gateway/Campagne.gateway";

export async function createCampagne(data: Partial<CampagneModel>): Promise<CampagneModel> {
    const planMarketingTestModule = getPlanMarketingTestModuleRef();
    const campagneGateway = planMarketingTestModule.get<CampagneGateway>(CampagneGateway);
    const defaultCampagne: Partial<CampagneModel> = {
        nom: "Test Campaign",
        objet: "Test Subject",
        templateId: 1,
        generic: true,
        destinataires: [],
        ...data,
    } as Partial<CampagneModel>;

    return campagneGateway.save(defaultCampagne as CampagneModel);
}
