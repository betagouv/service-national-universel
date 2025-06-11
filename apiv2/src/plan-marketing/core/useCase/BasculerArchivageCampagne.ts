import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneModel, CampagneSpecifiqueModelWithoutRef, CampagneSpecifiqueModelWithRefAndGeneric } from "../Campagne.model";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { isCampagneGenerique, isCampagneWithRef } from "snu-lib";
import { CampagneService } from "../service/Campagne.service";

@Injectable()
export class BasculerArchivageCampagne implements UseCase<CampagneModel | null> {
    constructor(@Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway, private readonly campagneService: CampagneService) {}

    async execute(id: string): Promise<CampagneModel | null> {
        const campagne = await this.campagneGateway.findById(id);
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }

        // Cas campagne spécifique liée
        if (isCampagneWithRef(campagne)) {
            const campagneGenerique = await this.campagneGateway.findById(campagne.campagneGeneriqueId);
            if (!campagneGenerique) {
                throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
            }

            const basculerIsArchived = !(campagne as CampagneSpecifiqueModelWithRefAndGeneric).isArchived;
            const basculerIsProgrammationActive = false;

            const campagneSpecifiqueWithRefToCampagneSpecifiqueWithouRef: CampagneSpecifiqueModelWithoutRef = {
                id: campagne.id,
                generic: false,
                cohortId: campagne.cohortId,
                originalCampagneGeneriqueId: campagne.campagneGeneriqueId,
                nom: (campagneGenerique as CampagneSpecifiqueModelWithoutRef).nom,
                objet: (campagneGenerique as CampagneSpecifiqueModelWithoutRef).objet,
                templateId: (campagneGenerique as CampagneSpecifiqueModelWithoutRef).templateId,
                listeDiffusionId: (campagneGenerique as CampagneSpecifiqueModelWithoutRef).listeDiffusionId,
                destinataires: (campagneGenerique as CampagneSpecifiqueModelWithoutRef).destinataires,
                type: (campagneGenerique as CampagneSpecifiqueModelWithoutRef).type,
                envois: campagneGenerique.envois,
                programmations: (campagneGenerique as CampagneSpecifiqueModelWithoutRef).programmations,
                isProgrammationActive: basculerIsProgrammationActive,
                isArchived: basculerIsArchived,
            };

            return await this.campagneService.updateAndRemoveRef(campagneSpecifiqueWithRefToCampagneSpecifiqueWithouRef);
        }

        if (campagne.isArchived) {
            const campagneUpdated = await this.campagneGateway.update({
                ...campagne,
                isArchived: false,
            });
            return campagneUpdated;
        } else {
            const campagneUpdated = await this.campagneGateway.update({
                ...campagne,
                isArchived: true,
                isProgrammationActive: false,
            });

            if (isCampagneGenerique(campagne)) {
                const campagnesSpecifiques = await this.campagneGateway.search({
                    generic: false,
                    campagneGeneriqueId: id,
                });

                for (const campagneSpecifique of campagnesSpecifiques) {
                    if (isCampagneWithRef(campagneSpecifique)) {
                        continue;
                    }

                    await this.campagneGateway.update({
                        ...campagneSpecifique,
                        isProgrammationActive: false,
                    });
                }
            }

            return campagneUpdated;
        }
    }
}
