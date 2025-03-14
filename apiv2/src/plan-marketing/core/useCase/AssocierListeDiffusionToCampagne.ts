import { Inject, Injectable, Logger } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";

Injectable();
export class AssocierListeDiffusionToCampagne implements UseCase<void> {
    private readonly logger: Logger = new Logger(AssocierListeDiffusionToCampagne.name);

    constructor(@Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway) {}

    async execute(nomListe?: string, campagneProviderId?: string): Promise<void> {
        // campagneId du provider
        this.logger.log(`nomListe: ${nomListe}, campagneId: ${campagneProviderId}`);
        if (!nomListe || !campagneProviderId) {
            throw new FunctionalException(
                FunctionalExceptionCode.CANNOT_ASSOCIATE_LIST_TO_CAMPAIGN,
                "nomListe et campagneId sont obligatoires",
            );
        }

        return await this.planMarketingGateway.updateCampagne(nomListe, campagneProviderId);
    }
}
