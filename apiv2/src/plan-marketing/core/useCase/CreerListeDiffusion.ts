import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { ClasseGateway } from "@admin/core/sejours/cle/classe/Classe.gateway";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { UseCase } from "@shared/core/UseCase";
import {
    DestinataireListeDiffusion,
    ROLES,
    SUB_ROLES,
    SearchParams,
    YoungType,
    isCampagneGenerique,
    isCampagneSansRef,
    isCampagneWithRef,
} from "snu-lib";
import { SearchYoungGateway } from "src/analytics/core/SearchYoung.gateway";
import { CampagneSpecifiqueModelWithRefAndGeneric, CampagneSpecifiqueModelWithoutRef } from "../Campagne.model";
import { CampagneGateway } from "../gateway/Campagne.gateway";
import { PlanMarketingGateway } from "../gateway/PlanMarketing.gateway";
import { ListeDiffusionService } from "../service/ListeDiffusion.service";
import { FileGateway } from "@shared/core/File.gateway";
import { PointDeRassemblementGateway } from "@admin/core/sejours/phase1/pointDeRassemblement/PointDeRassemblement.gateway";
import { LigneDeBusGateway } from "@admin/core/sejours/phase1/ligneDeBus/LigneDeBus.gateway";
import { CentreGateway } from "@admin/core/sejours/phase1/centre/Centre.gateway";
import { ColumnCsvName, ColumnType } from "../ListeDiffusion.model";
import { SegmentDeLigneGateway } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
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
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(PointDeRassemblementGateway) private readonly pointDeRassemblementGateway: PointDeRassemblementGateway,
        @Inject(LigneDeBusGateway) private readonly ligneDeBusGateway: LigneDeBusGateway,
        @Inject(CentreGateway) private readonly centreGateway: CentreGateway,
        @Inject(SegmentDeLigneGateway) private readonly segmentDeLigneGateway: SegmentDeLigneGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
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

        const classeIds = new Set<string>();
        const meetingPointIds = new Set<string>();
        const cohesionCenterIds = new Set<string>();
        const ligneIds = new Set<string>();
        for (const young of youngs.hits) {
            if (young.classeId) {
                classeIds.add(young.classeId);
            }
            if (young.meetingPointId) {
                meetingPointIds.add(young.meetingPointId);
            }
            if (young.ligneId) {
                ligneIds.add(young.ligneId);
            }
            if (young.cohesionCenterId) {
                cohesionCenterIds.add(young.cohesionCenterId);
            }
        }
        const referentIds = await this.classeGateway.findReferentIdsByClasseIds([...classeIds]);
        const referents = await this.referentGateway.findByIds(referentIds);
        const pointDeRassemblements = await this.pointDeRassemblementGateway.findByIds([...meetingPointIds]);
        const lignes = await this.ligneDeBusGateway.findByIds([...ligneIds]);
        const centres = await this.centreGateway.findByIds([...cohesionCenterIds]);
        const segmentDeLignes = await this.segmentDeLigneGateway.findByLigneDeBusIds([...ligneIds]);

        const contactsForListeDiffusion: ColumnCsvName[] = youngs.hits.map((young) => {
            const dateAller = lignes.find((ligne) => ligne.id === young.ligneId)?.dateDepart;

            const dateRetour = lignes.find((ligne) => ligne.id === young.ligneId)?.dateRetour;

            return {
                type: ColumnType.jeunes,
                PRENOM: young.firstName,
                NOM: young.lastName,
                EMAIL: young.email,
                COHORT: young.cohort,
                CENTRE: centres.find((centre) => centre.id === young.cohesionCenterId)?.nom,
                VILLECENTRE: centres.find((centre) => centre.id === young.cohesionCenterId)?.ville,
                PRENOMVOLONTAIRE: young.firstName,
                NOMVOLONTAIRE: young.lastName,
                PDR_ALLER: pointDeRassemblements.find((pdr) => pdr.id === young.meetingPointId)?.nom,
                PDR_ALLER_ADRESSE: pointDeRassemblements.find((pdr) => pdr.id === young.meetingPointId)?.adresse,
                PDR_ALLER_VILLE: pointDeRassemblements.find((pdr) => pdr.id === young.meetingPointId)?.ville,
                PDR_RETOUR: pointDeRassemblements.find((pdr) => pdr.id === young.meetingPointId)?.nom,
                PDR_RETOUR_VILLE: pointDeRassemblements.find((pdr) => pdr.id === young.meetingPointId)?.ville,
                PDR_RETOUR_ADRESSE: pointDeRassemblements.find((pdr) => pdr.id === young.meetingPointId)?.adresse,
                DATE_ALLER: this.clockGateway.isValidDate(dateAller) ? this.clockGateway.formatShort(dateAller) : "",
                HEURE_ALLER: segmentDeLignes.find((segment) => segment.ligneDeBusId === young.ligneId)?.heureDepart,
                DATE_RETOUR: this.clockGateway.isValidDate(dateRetour) ? this.clockGateway.formatShort(dateRetour) : "",
                HEURE_RETOUR: segmentDeLignes.find((segment) => segment.ligneDeBusId === young.ligneId)?.heureRetour,
                role: "",
            };
        });

        // Cas REFERENTS_CLASSES
        if (destinataires.includes(DestinataireListeDiffusion.REFERENTS_CLASSES)) {
            this.logger.log(`Cas REFERENTS_CLASSES, campagne: ${campagne.id}`);

            contactsForListeDiffusion.push(
                ...referents
                    .filter((referent) => referent.role === ROLES.REFERENT_CLASSE)
                    .map((referent) => ({
                        type: ColumnType.representants,
                        PRENOM: referent.prenom,
                        NOM: referent.nom,
                        EMAIL: referent.email,
                    })),
            );
        }

        // Cas CHEFS_ETABLISSEMENT
        if (destinataires.includes(DestinataireListeDiffusion.CHEFS_ETABLISSEMENT)) {
            this.logger.log(`Cas CHEFS_ETABLISSEMENT, campagne: ${campagne.id}`);
            contactsForListeDiffusion.push(
                ...referents
                    .filter(
                        (referent) =>
                            referent.role === ROLES.ADMINISTRATEUR_CLE &&
                            referent.sousRole === SUB_ROLES.referent_etablissement,
                    )
                    .map((referent) => ({
                        type: ColumnType.representants,
                        PRENOM: referent.prenom,
                        NOM: referent.nom,
                        EMAIL: referent.email,
                        role: referent.role,
                    })),
            );
        }

        // Cas CHEFS_CENTRES
        if (destinataires.includes(DestinataireListeDiffusion.CHEFS_CENTRES)) {
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
                        type: ColumnType.representants,
                        PRENOM: referentChefDeCentre.prenom,
                        NOM: referentChefDeCentre.nom,
                        EMAIL: referentChefDeCentre.email,
                        role: referentChefDeCentre.role,
                    })),
            );
        }

        // Cas COORDINATEURS_CLE
        if (destinataires.includes(DestinataireListeDiffusion.COORDINATEURS_CLE)) {
            this.logger.log(`Cas COORDINATEURS_CLE, campagne: ${campagne.id}`);
            contactsForListeDiffusion.push(
                ...referents
                    .filter(
                        (referent) =>
                            referent.role === ROLES.ADMINISTRATEUR_CLE &&
                            referent.sousRole === SUB_ROLES.coordinateur_cle,
                    )
                    .map((referent) => ({
                        type: ColumnType.representants,
                        PRENOM: referent.prenom,
                        NOM: referent.nom,
                        email: referent.email,
                        role: referent.role,
                    })),
            );
        }

        const csvContacts = await this.fileGateway.generateCSV(contactsForListeDiffusion);

        // return JSON.stringify(contactsForListeDiffusion);
        return csvContacts;
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
        const filtreListeDiffusionWithCohortId: Record<keyof YoungType, string[]> = {
            ...(listeDiffusion.filters as Record<keyof YoungType, string[]>),
            cohortId: [campagne.cohortId],
        };

        // Créer la liste de diffusion
        const contactsQuery: SearchParams = {
            filters: filtreListeDiffusionWithCohortId,
            sourceFields: ["email", "firstName", "lastName", "meetingPointId", "ligneId", "cohesionCenterId", "cohort"],
            full: true,
        };
        if (destinataires.includes(DestinataireListeDiffusion.REPRESENTANTS_LEGAUX)) {
            contactsQuery.sourceFields?.push("parent1Email", "parent2Email");
        }
        if (destinataires.includes(DestinataireListeDiffusion.REFERENTS_CLASSES)) {
            contactsQuery.sourceFields?.push("classeId", "etablissementId");
        }

        if (destinataires.includes(DestinataireListeDiffusion.CHEFS_CENTRES)) {
            contactsQuery.sourceFields?.push("cohesionCenterId");
        }

        return contactsQuery;
    }

    private mapColumnName(csvContacts: string): string {
        //
        return "";
    }
}
