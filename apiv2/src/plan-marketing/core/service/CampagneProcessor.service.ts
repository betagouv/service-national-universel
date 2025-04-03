import { Inject, Injectable, Logger } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { ListeDiffusionService } from "./ListeDiffusion.service";
import { SearchYoungGateway, SearchYoungResult } from "src/analytics/core/SearchYoung.gateway";
import { DestinataireListeDiffusion } from "snu-lib";
import { isCampagneGenerique, isCampagneSansRef, isCampagneWithRef } from "snu-lib";
import { CampagneSpecifiqueModelWithRefAndGeneric, CampagneSpecifiqueModelWithoutRef } from "../Campagne.model";
import { SearchParams } from "snu-lib";

@Injectable()
export class CampagneProcessorService {
    private readonly logger: Logger = new Logger(CampagneProcessorService.name);

    constructor(
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(ListeDiffusionService) private readonly listeDiffusionService: ListeDiffusionService,
        @Inject(SearchYoungGateway) private readonly searchYoungGateway: SearchYoungGateway,
    ) {}

    async validateAndProcessCampaign(campagneId: string): Promise<{
        contactsQuery: SearchParams;
        destinataires: DestinataireListeDiffusion[];
        youngs: SearchYoungResult;
    }> {
        this.logger.log(`campagneId: ${campagneId}`);
        const campagne = await this.campagneGateway.findById(campagneId);

        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }

        if (isCampagneGenerique(campagne)) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_SHOULD_NOT_BE_GENERIC);
        }

        let contactsQuery: SearchParams = {};
        let destinataires: DestinataireListeDiffusion[] = [];

        if (isCampagneWithRef(campagne)) {
            this.logger.log(
                `Cas campagne spécifique liée à une campagne générique, campagne: ${campagne.id}, liée à la campagne générique: ${campagne.campagneGeneriqueId}`,
            );
            const campagneSpecifique = await this.campagneGateway.findSpecifiqueWithRefById(campagne.id);
            destinataires = campagneSpecifique!.destinataires;
            contactsQuery = await this.buildListeDiffusionFiltre(campagneSpecifique, destinataires);
        } else if (isCampagneSansRef(campagne)) {
            this.logger.log(`Cas campagne spécifique non liée à une campagne générique, campagne: ${campagne.id}`);
            destinataires = campagne.destinataires;
            contactsQuery = await this.buildListeDiffusionFiltre(campagne, destinataires);
        }

        const youngs = await this.searchYoungGateway.searchYoung(contactsQuery);

        return {
            contactsQuery,
            destinataires,
            youngs,
        };
    }

    private async buildListeDiffusionFiltre(
        campagne: CampagneSpecifiqueModelWithoutRef | CampagneSpecifiqueModelWithRefAndGeneric | null,
        destinataires: DestinataireListeDiffusion[],
    ): Promise<SearchParams> {
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        const listeDiffusion = await this.listeDiffusionService.getListeDiffusionById(campagne.listeDiffusionId);
        if (!listeDiffusion) {
            throw new FunctionalException(FunctionalExceptionCode.LISTE_DIFFUSION_NOT_FOUND);
        }
        this.logger.log(`Liste de diffusion: ${listeDiffusion.id}`);
        const filtreListeDiffusionWithCohortId: Record<string, string[]> = {
            ...(listeDiffusion.filters as Record<string, string[]>),
            cohortId: [campagne.cohortId],
        };

        const contactsQuery: SearchParams = {
            filters: filtreListeDiffusionWithCohortId,
            sourceFields: [
                "email",
                "firstName",
                "lastName",
                "meetingPointId",
                "ligneId",
                "cohort",
                "classeId",
                "etablissementId",
                "cohesionCenterId",
            ],
            full: true,
        };

        if (destinataires.includes(DestinataireListeDiffusion.REPRESENTANTS_LEGAUX)) {
            contactsQuery.sourceFields?.push(
                "parent1Email",
                "parent1FirstName",
                "parent1LastName",
                "parent2Email",
                "parent2FirstName",
                "parent2LastName",
            );
        }

        return contactsQuery;
    }
}
