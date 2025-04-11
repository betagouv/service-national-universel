import { Inject, Injectable } from "@nestjs/common";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { UseCase } from "@shared/core/UseCase";
import { CampagneGateway } from "../../gateway/Campagne.gateway";
import { PreparerEnvoiCampagne } from "../PreparerEnvoiCampagne";

@Injectable()
export class EnvoyerCampagneProgrammee implements UseCase<void> {
    constructor(
        private readonly preparerEnvoiCampagne: PreparerEnvoiCampagne,
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
    ) {}

    async execute(): Promise<void> {
        const now = this.clockGateway.now();
        const yesterday = this.clockGateway.addDays(now, -1);

        const campagnesWithProgrammation = await this.campagneGateway.findCampagnesWithProgrammationBetweenDates(
            yesterday,
            now,
        );

        const campagnesProgrammeesIds = campagnesWithProgrammation.map((campagne) => campagne.id);

        for (const campagneProgrammeeId of campagnesProgrammeesIds) {
            await this.preparerEnvoiCampagne.execute(campagneProgrammeeId);
        }
    }
}
