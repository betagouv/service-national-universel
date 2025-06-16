import { Inject, Injectable, Logger } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { AssocierListeDiffusionToCampagne } from "./AssocierListeDiffusionToCampagne";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { EnvoiCampagneStatut, isCampagneWithRef } from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { MettreAJourCampagne } from "./MettreAJourCampagne";
import { CampagneModel } from "../Campagne.model";

@Injectable()
export class EnvoyerCampagne implements UseCase<void> {
    private readonly logger: Logger = new Logger(EnvoyerCampagne.name);

    constructor(
        @Inject(AssocierListeDiffusionToCampagne)
        private readonly associerListeDiffusionToCampagne: AssocierListeDiffusionToCampagne,
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(MettreAJourCampagne) private readonly mettreAJourCampagne: MettreAJourCampagne,
    ) {}
    async execute(
        nomListe: string | undefined,
        campagneId: string | undefined,
        campagneProviderId: string | undefined,
        programmationId?: string,
    ): Promise<void> {
        if (nomListe === undefined || campagneId === undefined || campagneProviderId === undefined) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_FOUND,
                "Nom de liste et campagneProviderId sont requis",
            );
        }
        await this.associerListeDiffusionToCampagne.execute(nomListe, campagneProviderId);
        this.logger.log(`Sending campagne ${campagneProviderId} to brevo`);
        await this.planMarketingGateway.sendCampagneNow(campagneProviderId);
        await this.campagneGateway.addEnvoiToCampagneById(campagneId, {
            date: this.clockGateway.now(),
            statut: EnvoiCampagneStatut.TERMINE,
        });

        const campagne: CampagneModel | null = await this.campagneGateway.findById(campagneId);
        if (campagne !== null && isCampagneWithRef(campagne)) {
            // Appel de mettreAJourCampagne pour supprimer la référence à la campagne spécifique
            await this.mettreAJourCampagne.execute(campagne);
        }
        if (programmationId) {
            await this.campagneGateway.updateProgrammationSentDate(
                campagneId,
                programmationId,
                this.clockGateway.now(),
            );
        }
    }
}
