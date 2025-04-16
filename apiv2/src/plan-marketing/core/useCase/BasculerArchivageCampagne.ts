import { Inject, Injectable } from "@nestjs/common";
import { UseCase } from "@shared/core/UseCase";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneModel } from "../Campagne.model";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { isCampagneGenerique, isCampagneWithRef } from "snu-lib";

@Injectable()
export class BasculerArchivageCampagne implements UseCase<CampagneModel | null> {
    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway
    ) {}

    async execute(id: string): Promise<CampagneModel | null> {
        const campagne = await this.campagneGateway.findById(id);
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }

        if (!isCampagneGenerique(campagne)) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_GENERIC);
        }

        if (campagne.isArchived) {
            const campagneUpdated = await this.campagneGateway.update({
                ...campagne,
                isArchived: false,
            });
            return campagneUpdated;
        }
        else {
            const campagneUpdated = await this.campagneGateway.update({
                ...campagne,
                isArchived: true,
                isProgrammationActive: false,
            });

            const campagnesSpecifiques = await this.campagneGateway.search({
                generic: false,
                campagneGeneriqueId: id
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

            return campagneUpdated;
        }
    }
}