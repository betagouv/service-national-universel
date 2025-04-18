import { Inject, Injectable, Logger } from "@nestjs/common";
import { CampagneService } from "@plan-marketing/core/service/Campagne.service";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { UseCase } from "@shared/core/UseCase";
import { PreparerEnvoiCampagne } from "../PreparerEnvoiCampagne";
import { ProgrammationService } from "@plan-marketing/core/service/Programmation.service";

@Injectable()
export class EnvoyerCampagneProgrammee implements UseCase<void> {
    private readonly logger: Logger = new Logger(EnvoyerCampagneProgrammee.name);

    constructor(
        private readonly preparerEnvoiCampagne: PreparerEnvoiCampagne,
        private readonly campagneService: CampagneService,
        private readonly programmationService: ProgrammationService,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
    ) {}

    async execute(): Promise<void> {
        this.logger.log("Début de l'exécution de la tâche de planification des campagnes");
        const now = this.clockGateway.now();
        const yesterday = this.clockGateway.addDays(now, -1);
        this.logger.log(`Recherche des campagnes avec programmation entre ${yesterday} et ${now}`);
        const campagnesWithProgrammation = await this.campagneService.findActivesCampagnesWithProgrammationBetweenDates(
            yesterday,
            now,
        );

        const campagnesProgrammeesProgrammationsToSend = new Map<string, string[]>();
        for (const campagne of campagnesWithProgrammation) {
            const programmationIds = campagne.programmations
                ?.filter((programmation) =>
                    this.programmationService.shouldProgrammationBeSent(programmation, yesterday, now),
                )
                .map((programmation) => programmation.id)
                .filter((id) => id !== undefined);
            if (programmationIds && programmationIds.length > 0) {
                campagnesProgrammeesProgrammationsToSend.set(campagne.id, programmationIds);
            }
        }

        for (const [campagneId, programmationIds] of campagnesProgrammeesProgrammationsToSend.entries()) {
            for (const programmationId of programmationIds) {
                this.logger.log(
                    `Préparation de l'envoi de la campagne ${campagneId} pour la programmation ${programmationId}`,
                );
                await this.preparerEnvoiCampagne.execute(campagneId);

                await this.campagneService.updateProgrammationSentDate(
                    campagneId,
                    programmationId,
                    this.clockGateway.now(),
                );
            }
        }
    }
}
