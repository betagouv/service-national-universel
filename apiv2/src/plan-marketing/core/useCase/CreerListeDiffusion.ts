import { Inject, Injectable, Logger } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import {
    DestinataireListeDiffusion,
    ROLES,
    SUB_ROLES,
    SearchParams,
    isCampagneGenerique,
    isCampagneSansRef,
    isCampagneWithRef,
} from "snu-lib";
import { SearchYoungGateway } from "src/analytics/core/SearchYoung.gateway";
import { CampagneSpecifiqueModel, CampagneSpecifiqueModelWithRefAndGeneric } from "../Campagne.model";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { ListeDiffusionService } from "../service/ListeDiffusion.service";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
Injectable();
export class CreerListeDiffusion implements UseCase<string> {
    private readonly logger: Logger = new Logger(CreerListeDiffusion.name);

    constructor(
        @Inject(PlanMarketingGateway) private readonly planMarketingGateway: PlanMarketingGateway,
        @Inject(CampagneGateway) private readonly campagneGateway: CampagneGateway,
        @Inject(SearchYoungGateway) private readonly searchYoungGateway: SearchYoungGateway,
        private readonly listeDiffusionService: ListeDiffusionService,
        @Inject(ClasseGateway) private readonly classeGateway: ClasseGateway,
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
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

        let contactsQuery: SearchParams = {};

        if (isCampagneWithRef(campagne)) {
            this.logger.log(
                `Cas campagne spécifique liée à une campagne générique, campagne: ${campagne.id}, liée à la campagne générique: ${campagne.campagneGeneriqueId}`,
            );
            const campagneSpecifique = await this.campagneGateway.findSpecifiqueWithRefById(campagne.id);
            contactsQuery = await this.buildListeDiffusionFiltre(campagneSpecifique);
        } else if (isCampagneSansRef(campagne)) {
            this.logger.log(`Cas campagne spécifique non liée à une campagne générique, campagne: ${campagne.id}`);
            contactsQuery = await this.buildListeDiffusionFiltre(campagne);
        }
        const youngs = await this.searchYoungGateway.searchYoung(contactsQuery);
        const contactsForListeDiffusion = youngs.hits.map((young) => ({
            firstName: young.firstName,
            lastName: young.lastName,
            email: young.email,
        }));

        const classeIds = new Set<string>();
        for (const young of youngs.hits) {
            if (young.classeId) {
                classeIds.add(young.classeId);
            }
        }
        const referentIds = await this.classeGateway.findReferentIdsByClasseIds([...classeIds]);
        const referents = await this.referentGateway.findByIds(referentIds);

        // Cas REFERENTS_CLASSES
        //@ts-expect-error
        if (campagne.destinataires.includes(DestinataireListeDiffusion.REFERENTS_CLASSES)) {
            this.logger.log(`Cas REFERENTS_CLASSES, campagne: ${campagne.id}`);

            contactsForListeDiffusion.push(
                ...referents
                    .filter((referent) => referent.role === ROLES.REFERENT_CLASSE)
                    .map((referent) => ({
                        firstName: referent.prenom,
                        lastName: referent.nom,
                        email: referent.email,
                    })),
            );
        }

        // Cas CHEFS_ETABLISSEMENT
        //@ts-expect-error
        if (campagne.destinataires.includes(DestinataireListeDiffusion.CHEFS_ETABLISSEMENT)) {
            this.logger.log(`Cas CHEFS_ETABLISSEMENT, campagne: ${campagne.id}`);
            contactsForListeDiffusion.push(
                ...referents
                    .filter(
                        (referent) =>
                            referent.role === ROLES.ADMINISTRATEUR_CLE &&
                            referent.sousRole === SUB_ROLES.referent_etablissement,
                    )
                    .map((referent) => ({
                        firstName: referent.prenom,
                        lastName: referent.nom,
                        email: referent.email,
                    })),
            );
        }

        // Cas CHEFS_CENTRES
        //@ts-expect-error
        if (campagne.destinataires.includes(DestinataireListeDiffusion.CHEFS_CENTRES)) {
            this.logger.log(`Cas CHEFS_CENTRES, campagne: ${campagne.id}`);
            const cohesionCenterIds = new Set<string>();
            for (const young of youngs.hits) {
                if (young.cohesionCenterId) {
                    cohesionCenterIds.add(young.cohesionCenterId);
                }
            }
            const referentsChefsDeCentre = await this.referentGateway.findByCohesionCenterIds([...cohesionCenterIds]);
            contactsForListeDiffusion.push(
                ...referentsChefsDeCentre
                    .filter((referentChefDeCentre) => referentChefDeCentre.role === ROLES.HEAD_CENTER)
                    .map((referentChefDeCentre) => ({
                        firstName: referentChefDeCentre.prenom,
                        lastName: referentChefDeCentre.nom,
                        email: referentChefDeCentre.email,
                    })),
            );
        }

        // Cas COORDINATEURS_CLE
        //@ts-expect-error
        if (campagne.destinataires.includes(DestinataireListeDiffusion.COORDINATEURS_CLE)) {
            this.logger.log(`Cas COORDINATEURS_CLE, campagne: ${campagne.id}`);
            contactsForListeDiffusion.push(
                ...referents
                    .filter(
                        (referent) =>
                            referent.role === ROLES.ADMINISTRATEUR_CLE &&
                            referent.sousRole === SUB_ROLES.coordinateur_cle,
                    )
                    .map((referent) => ({
                        firstName: referent.prenom,
                        lastName: referent.nom,
                        email: referent.email,
                    })),
            );
        }

        // TODO: changer la signature
        return JSON.stringify(contactsForListeDiffusion);
    }

    private async buildListeDiffusionFiltre(
        campagne: CampagneSpecifiqueModel | CampagneSpecifiqueModelWithRefAndGeneric | null,
    ): Promise<SearchParams> {
        if (!campagne) {
            throw new FunctionalException(FunctionalExceptionCode.CAMPAIGN_NOT_FOUND);
        }
        //@ts-expect-error
        const listeDiffusion = await this.listeDiffusionService.getListeDiffusionById(campagne.listeDiffusionId);
        if (!listeDiffusion) {
            throw new FunctionalException(FunctionalExceptionCode.LISTE_DIFFUSION_NOT_FOUND);
        }
        this.logger.log(`Liste de diffusion: ${listeDiffusion.id}`);
        const filtreListeDiffusionWithCohortId = { ...listeDiffusion.filters, cohortId: [campagne.cohortId] };

        // Créer la liste de diffusion
        const contactsQuery: SearchParams = {
            filters: filtreListeDiffusionWithCohortId,
            sourceFields: ["email", "firstName", "lastName"],
            full: true,
        };
        // Cas  REPRESENTANTS_LEGAUX
        //@ts-ignore
        if (campagne.destinataires === DestinataireListeDiffusion.REPRESENTANTS_LEGAUX) {
            contactsQuery.sourceFields?.push("parent1Email", "parent2Email");
        }
        //@ts-ignore
        if (campagne.destinataires.includes(DestinataireListeDiffusion.REFERENTS_CLASSES)) {
            contactsQuery.sourceFields?.push("classeId", "etablissementId");
        }

        //@ts-ignore
        if (campagne.destinataires.includes(DestinataireListeDiffusion.CHEFS_CENTRES)) {
            contactsQuery.sourceFields?.push("cohesionCenterId");
        }

        return contactsQuery;
    }
}
