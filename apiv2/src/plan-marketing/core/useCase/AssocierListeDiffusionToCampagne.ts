import { Inject, Injectable, Logger } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";

Injectable();
export class AssocierListeDiffusionToCampagne implements UseCase<void> {
    private readonly logger: Logger = new Logger(AssocierListeDiffusionToCampagne.name);

    constructor(@Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway) {}

    async execute(nomListe?: string, campagneId?: string): Promise<void> {
        this.logger.log(`nomListe: ${nomListe}, campagneId: ${campagneId}`);
        if (!nomListe || !campagneId) {
            throw new FunctionalException(
                FunctionalExceptionCode.CANNOT_ASSOCIATE_LIST_TO_CAMPAIGN,
                "nomListe et campagneId sont obligatoires",
            );
        }

        return await this.planMarketingGateway.updateCampagne(nomListe, campagneId);
    }
}
