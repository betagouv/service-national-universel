import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { AssocierListeDiffusionToCampagne } from "./AssocierListeDiffusionToCampagne";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
Injectable();
export class EnvoyerCampagne implements UseCase<void> {
    constructor(
        @Inject(AssocierListeDiffusionToCampagne)
        private readonly associerListeDiffusionToCampagne: AssocierListeDiffusionToCampagne,
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
    ) {}
    async execute(nomListe: string | undefined, campagneProviderId: string | undefined): Promise<void> {
        if (nomListe === undefined || campagneProviderId === undefined) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Nom de liste et campagneProviderId sont requis",
            );
        }
        await this.associerListeDiffusionToCampagne.execute(nomListe, campagneProviderId);
        await this.planMarketingGateway.sendCampagneNow(campagneProviderId);
    }
}
