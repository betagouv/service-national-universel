import { Inject, Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { TaskGateway } from "@task/core/Task.gateway";

Injectable();
export class AssocierListeDiffusionToCampagne implements UseCase<void> {
    private readonly logger: Logger = new Logger(AssocierListeDiffusionToCampagne.name);
    constructor(
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        @Inject(TaskGateway) private readonly taskGateway: TaskGateway,
    ) {}
    async execute(nomListe?: string, campagneId?: string): Promise<void> {
        this.logger.log(`nomListe: ${nomListe}, campagneId: ${campagneId}`);
        if (!nomListe || !campagneId) {
            throw new FunctionalException(
                FunctionalExceptionCode.CANNOT_ASSOCIATE_LIST_TO_CAMPAIGN,
                "nomListe et campagneId sont obligatoires",
            );
        }

        // Ajouter listeId à la campagne
        return await this.planMarketingGateway.updateCampagne(nomListe, campagneId);
    }
}
