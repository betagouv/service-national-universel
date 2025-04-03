import { UseCase } from "@shared/core/UseCase";
import {
    CampagneGeneriqueModel,
    CampagneModel,
    CampagneSpecifiqueModelWithRef,
    CampagneSpecifiqueModelWithoutRef,
} from "../Campagne.model";
import { CampagneService } from "../service/Campagne.service";
import { isCampagneGenerique, isCampagneWithRef } from "snu-lib";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MettreAJourCampagne implements UseCase<CampagneModel | null> {
    constructor(private readonly campagneService: CampagneService) {}
    async execute(campagne: CampagneModel): Promise<CampagneModel | null> {
        const retrievedCampagne = await this.campagneService.findById(campagne.id);

        // Cas campagne générique
        if (isCampagneGenerique(retrievedCampagne)) {
            return await this.campagneService.updateCampagne(campagne);
        }
        // Cas campagne spécifique liée
        if (isCampagneWithRef(retrievedCampagne)) {
            const campagneSpecifiqueWithRefToCampagneSpecifiqueWithouRef: CampagneSpecifiqueModelWithoutRef = {
                id: retrievedCampagne.id,
                generic: false,
                cohortId: retrievedCampagne.cohortId,
                originalCampagneGeneriqueId: retrievedCampagne.campagneGeneriqueId,
                nom: (campagne as CampagneSpecifiqueModelWithoutRef).nom,
                objet: (campagne as CampagneSpecifiqueModelWithoutRef).objet,
                templateId: (campagne as CampagneSpecifiqueModelWithoutRef).templateId,
                listeDiffusionId: (campagne as CampagneSpecifiqueModelWithoutRef).listeDiffusionId,
                destinataires: (campagne as CampagneSpecifiqueModelWithoutRef).destinataires,
                type: (campagne as CampagneSpecifiqueModelWithoutRef).type,
                envois: campagne.envois,
            };
            return await this.campagneService.updateAndRemoveRef(
                campagneSpecifiqueWithRefToCampagneSpecifiqueWithouRef,
            );
        }

        // Cas campagne spécifique non liée
        return await this.campagneService.updateCampagne(campagne);
    }
}
