import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import { UseCase } from "@shared/core/UseCase";
import { TaskGateway } from "@task/core/Task.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ConfigService } from "@nestjs/config";
import { SearchParams, TaskName, TaskStatus, isCampagneGenerique, isCampagneWithRef } from "snu-lib";
import { PlanMarketingCreateTaskModel } from "../PlanMarketing.model";
import { ListeDiffusionService } from "../service/ListeDiffusion.service";
import { SearchYoungGateway } from "src/analytics/core/SearchYoung.gateway";
import { CampagneGateway } from "../gateway/Campagne.gateway";
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
        let campagneToBeUsed = campagne;
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        if (isCampagneGenerique(campagne)) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC);
        }

        // TODO : gérer les campagnes spécifiques liées
        if (isCampagneWithRef(campagne)) {
            const campagneGenerique = await this.campagneGateway.findById(campagne.campagneGeneriqueId);
        }
        //@ts-expect-error
        const listeDiffusion = await this.listeDiffusionService.getListeDiffusionById(campagne.listeDiffusionId);
        if (!listeDiffusion) {
            throw new FunctionalException(FunctionalExceptionCode.LISTE_DIFFUSION_NOT_FOUND);
        }
        const filtreListeDiffusionWithCohortId = { ...listeDiffusion.filters, cohortId: [campagne.cohortId] };
        // Créer la liste de diffusion
        const contactsQuery: SearchParams = { filters: filtreListeDiffusionWithCohortId };
        const contacts = await this.searchYoungGateway.searchYoung(contactsQuery);

        return JSON.stringify(contacts);
    }
}
