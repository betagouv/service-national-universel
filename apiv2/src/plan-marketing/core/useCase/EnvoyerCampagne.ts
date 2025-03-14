import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { AssocierListeDiffusionToCampagne } from "./AssocierListeDiffusionToCampagne";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { EnvoiCampagneStatut } from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
Injectable();
export class EnvoyerCampagne implements UseCase<void> {
    constructor(
        @Inject(AssocierListeDiffusionToCampagne)
        private readonly associerListeDiffusionToCampagne: AssocierListeDiffusionToCampagne,
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
    ) {}
    async execute(
        nomListe: string | undefined,
        campagneId: string | undefined,
        campagneProviderId: string | undefined,
    ): Promise<void> {
        if (nomListe === undefined || campagneId === undefined || campagneProviderId === undefined) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Nom de liste et campagneProviderId sont requis",
            );
        }
        await this.associerListeDiffusionToCampagne.execute(nomListe, campagneProviderId);
        // TODO: décommenter sendCampagneNow
        // await this.planMarketingGateway.sendCampagneNow(campagneProviderId);
        await this.campagneGateway.addEnvoiToCampagneById(campagneId, {
            date: this.clockGateway.now(),
            statut: EnvoiCampagneStatut.TERMINE,
        });
    }
}
