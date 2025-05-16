import { Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { CampagneComplete, CampagneModel } from "../Campagne.model";
import { CampagneService } from "../service/Campagne.service";
import { MettreAJourCampagne } from "./MettreAJourCampagne";
import { isCampagneGenerique } from "snu-lib";
import { FunctionalException } from "@shared/core/FunctionalException";
import { FunctionalExceptionCode } from "@shared/core/FunctionalException";
@Injectable()
export class MettreAJourActivationProgrammationSpecifique implements UseCase<CampagneModel | null> {
    constructor(
        private readonly campagneService: CampagneService,
        private readonly mettreAJourCampagne: MettreAJourCampagne,
    ) {}
    async execute(campagneId: string, isProgrammationActive?: boolean): Promise<CampagneModel | null> {
        const campagne = await this.campagneService.findById(campagneId);
        if (isCampagneGenerique(campagne)) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC);
        }
        if (
            isProgrammationActive === undefined ||
            (campagne as CampagneComplete).isProgrammationActive === isProgrammationActive
        ) {
            return campagne;
        }

        const campagneToUpdate = { ...campagne, isProgrammationActive };
        return this.mettreAJourCampagne.execute(campagneToUpdate);
    }
}
