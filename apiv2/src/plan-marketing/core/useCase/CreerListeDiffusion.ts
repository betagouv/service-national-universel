import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { TaskGateway } from "@task/core/Task.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ConfigService } from "@nestjs/config";
import {
    CampagneSpecifique,
    SearchParams,
    TaskName,
    TaskStatus,
    isCampagneGenerique,
    isCampagneWithRef,
} from "snu-lib";
import { PlanMarketingCreateTaskModel } from "../PlanMarketing.model";
import { ListeDiffusionService } from "../service/ListeDiffusion.service";
import { SearchYoungGateway } from "src/analytics/core/SearchYoung.gateway";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { CampagneModel, CampagneSpecifiqueModelWithRefAndGeneric } from "../Campagne.model";
Injectable();
export class CreerListeDiffusion implements UseCase<string> {
    private readonly logger: Logger = new Logger(CreerListeDiffusion.name);

    constructor(
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(SearchYoungGateway) private readonly searchYoungGateway: SearchYoungGateway,
        private readonly listeDiffusionService: ListeDiffusionService,
    ) {}
    async execute(campagneId: string): Promise<string> {
        this.logger.log(`campagneId: ${campagneId}`);
        const campagne = await this.campagneGateway.findById(campagneId);
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        if (isCampagneGenerique(campagne)) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC);
        }

        let contactsQuery = await this.buildListeDiffusionFiltre(campagne);

        if (isCampagneWithRef(campagne)) {
            this.logger.log(
                `Cas campagne spécifique liée à une campagne générique, campagne: ${campagne.id}, liée à la campagne générique: ${campagne.campagneGeneriqueId}`,
            );
            const campagneSpecifique = await this.campagneGateway.findSpecifiqueWithRefById(campagne.id);
            contactsQuery = await this.buildListeDiffusionFiltre(campagneSpecifique);
        }
        const contacts = await this.searchYoungGateway.searchYoung(contactsQuery);

        // TODO: changer la signature
        return JSON.stringify(contacts);
    }

    private async buildListeDiffusionFiltre(
        campagne: CampagneSpecifique | CampagneSpecifiqueModelWithRefAndGeneric | null,
    ): Promise<SearchParams> {
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        //@ts-expect-error
        const listeDiffusion = await this.listeDiffusionService.getListeDiffusionById(campagne.listeDiffusionId);
        if (!listeDiffusion) {
            throw new FunctionalException(FunctionalExceptionCode.LISTE_DIFFUSION_NOT_FOUND);
        }
        const filtreListeDiffusionWithCohortId = { ...listeDiffusion.filters, cohortId: [campagne.cohortId] };
        // Créer la liste de diffusion
        const contactsQuery: SearchParams = {
            filters: filtreListeDiffusionWithCohortId,
            sourceFields: ["email", "parent1Email", "parent2Email"],
            size: 10000,
        };
        return contactsQuery;
    }
}
