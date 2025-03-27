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
import { COLUMN_CSV_HEADERS, ColumnCsvName, ColumnType } from "../ListeDiffusion.model";
import { SegmentDeLigneGateway } from "@admin/core/sejours/phase1/segmentDeLigne/SegmentDeLigne.gateway";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { EtablissementGateway } from "@admin/core/sejours/cle/etablissement/Etablissement.gateway";
import { SejourGateway } from "@admin/core/sejours/phase1/sejour/Sejour.gateway";

@Injectable()
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
        @Inject(EtablissementGateway) private readonly etablissementGateway: EtablissementGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
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
        const classes = (await this.classeGateway.findByIds([...classeIds])) || [];
        const referentClasseIds = await this.classeGateway.findReferentIdsByClasseIds([...classeIds]);
        const referentsClasse = await this.referentGateway.findByIds(referentClasseIds);

        // Chef d'établissement et coordinateur CLE
        const etablissementIds = new Set<string>();
        for (const classe of classes) {
            etablissementIds.add(classe.etablissementId);
        }
        const etablissements = (await this.etablissementGateway.findByIds([...etablissementIds])) || [];
        const chefEtablissementIds = new Set<string>();
        const coordinateurCleIds = new Set<string>();
        for (const etablissement of etablissements) {
            etablissement.referentEtablissementIds.forEach((id) => chefEtablissementIds.add(id));
            if (etablissement.coordinateurIds) {
                etablissement.coordinateurIds.forEach((id) => coordinateurCleIds.add(id));
            }
        }
        const chefsEtablissement = (await this.referentGateway.findByIds([...chefEtablissementIds])) || [];
        const coordinateursCle = (await this.referentGateway.findByIds([...coordinateurCleIds])) || [];

        // Chef de centre
        const sejourIds = new Set<string>();
        for (const classe of classes) {
            if (classe.sejourId) {
                sejourIds.add(classe.sejourId);
            }
        }
        const sejours = (await this.sejourGateway.findByIds([...sejourIds])) || [];
        const chefDeCentreIds = new Set<string>();
        for (const sejour of sejours) {
            if (sejour.chefDeCentreReferentId) {
                chefDeCentreIds.add(sejour.chefDeCentreReferentId);
            }
        }
        const chefsDeCentre = (await this.referentGateway.findByIds([...chefDeCentreIds])) || [];

        const pointDeRassemblements = await this.pointDeRassemblementGateway.findByIds([...meetingPointIds]);
        const lignes = await this.ligneDeBusGateway.findByIds([...ligneIds]);
        const centres = await this.centreGateway.findByIds([...cohesionCenterIds]);
        const segmentDeLignes = await this.segmentDeLigneGateway.findByLigneDeBusIds([...ligneIds]);

        const buildCsvContactRow = (young: YoungType) => {
            const dateAller = lignes.find((ligne) => ligne.id === young.ligneId)?.dateDepart;
            const dateRetour = lignes.find((ligne) => ligne.id === young.ligneId)?.dateRetour;
            return {
                type: ColumnType.jeunes,
                PRENOM: young.firstName,
                NOM: young.lastName,
                EMAIL: young.email,
                COHORT: young.cohort,
                CENTRE: centres.find((centre) => centre?.id === young.cohesionCenterId)?.nom,
                VILLECENTRE: centres.find((centre) => centre?.id === young.cohesionCenterId)?.ville,
                PRENOMVOLONTAIRE: young.firstName,
                NOMVOLONTAIRE: young.lastName,
                PDR_ALLER: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.nom,
                PDR_ALLER_ADRESSE: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.adresse,
                PDR_ALLER_VILLE: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.ville,
                PDR_RETOUR: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.nom,
                PDR_RETOUR_VILLE: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.ville,
                PDR_RETOUR_ADRESSE: pointDeRassemblements.find((pdr) => pdr?.id === young.meetingPointId)?.adresse,
                DATE_ALLER: this.clockGateway.isValidDate(dateAller) ? this.clockGateway.formatShort(dateAller) : "",
                HEURE_ALLER: segmentDeLignes.find((segment) => segment?.ligneDeBusId === young.ligneId)?.heureDepart,
                DATE_RETOUR: this.clockGateway.isValidDate(dateRetour) ? this.clockGateway.formatShort(dateRetour) : "",
                HEURE_RETOUR: segmentDeLignes.find((segment) => segment?.ligneDeBusId === young.ligneId)?.heureRetour,
                PRENOM_RL1: "",
                NOM_RL1: "",
                PRENOM_RL2: "",
                NOM_RL2: "",
                role: "",
            };
        };

        const contactsForListeDiffusion: ColumnCsvName[] = [];
        youngs.hits.forEach((young) => {
            const contactRow = buildCsvContactRow(young);
            contactsForListeDiffusion.push(contactRow);
            if (young.parent1Email) {
                const contactRowParent1 = {
                    ...contactRow,
                    type: ColumnType.representants,
                    PRENOM_RL1: young.parent1FirstName,
                    NOM_RL1: young.parent1LastName,
                    EMAIL: young.parent1Email,
                };
                contactsForListeDiffusion.push(contactRowParent1);
            }
            if (young.parent2Email) {
                const contactRowParent2 = {
                    ...contactRow,
                    type: ColumnType.representants,
                    PRENOM_RL2: young.parent2FirstName,
                    NOM_RL2: young.parent2LastName,
                    EMAIL: young.parent2Email,
                };
                contactsForListeDiffusion.push(contactRowParent2);
            }
        });

        // Cas REFERENTS_CLASSES
        if (destinataires.includes(DestinataireListeDiffusion.REFERENTS_CLASSES)) {
            this.logger.log(`Cas REFERENTS_CLASSES, campagne: ${campagne.id}`);
            contactsForListeDiffusion.push(
                ...referentsClasse
                    .filter((referent) => referent.role === ROLES.REFERENT_CLASSE)
                    .map((referent) => {
                        const classe = classes.find((classe) => classe.referentClasseIds.includes(referent.id));
                        const young = youngs.hits.find((young) => young.classeId === classe?.id);
                        if (young) {
                            const contactYoungRow = buildCsvContactRow(young);
                            return {
                                ...contactYoungRow,
                                type: ColumnType.referents,
                                PRENOM: referent.prenom,
                                NOM: referent.nom,
                                EMAIL: referent.email,
                                role: referent.role,
                            };
                        }

                        return {
                            type: ColumnType.referents,
                            PRENOM: referent.prenom,
                            NOM: referent.nom,
                            EMAIL: referent.email,
                            role: referent.role,
                        };
                    }),
            );
        }

        // Cas CHEFS_ETABLISSEMENT
        if (destinataires.includes(DestinataireListeDiffusion.CHEFS_ETABLISSEMENT)) {
            this.logger.log(`Cas CHEFS_ETABLISSEMENT, campagne: ${campagne.id}`);
            contactsForListeDiffusion.push(
                ...chefsEtablissement
                    .filter(
                        (chefEtablissement) =>
                            chefEtablissement.role === ROLES.ADMINISTRATEUR_CLE &&
                            chefEtablissement.sousRole === SUB_ROLES.referent_etablissement,
                    )
                    .map((chefEtablissement) => {
                        const etablissement = etablissements.find((etablissement) =>
                            etablissement.referentEtablissementIds.includes(chefEtablissement.id),
                        );
                        const classe = classes.find((classe) => classe.etablissementId === etablissement?.id);
                        const young = youngs.hits.find((young) => young.classeId === classe?.id);
                        if (young) {
                            const contactYoungRow = buildCsvContactRow(young);
                            return {
                                ...contactYoungRow,
                                type: ColumnType["chefs-etablissement"],
                                PRENOM: chefEtablissement.prenom,
                                NOM: chefEtablissement.nom,
                                EMAIL: chefEtablissement.email,
                                role: chefEtablissement.role,
                            };
                        }
                        return {
                            type: ColumnType["chefs-etablissement"],
                            PRENOM: chefEtablissement.prenom,
                            NOM: chefEtablissement.nom,
                            EMAIL: chefEtablissement.email,
                            role: chefEtablissement.role,
                        };
                    }),
            );
        }

        // Cas CHEFS_CENTRES
        if (destinataires.includes(DestinataireListeDiffusion.CHEFS_CENTRES)) {
            this.logger.log(`Cas CHEFS_CENTRES, campagne: ${campagne.id}`);
            contactsForListeDiffusion.push(
                ...chefsDeCentre.map((chefDeCentre) => {
                    const sejour = sejours.find((sejour) => sejour.chefDeCentreReferentId === chefDeCentre.id);
                    const classe = classes.find((classe) => classe.sejourId === sejour?.id);
                    const young = youngs.hits.find((young) => young.classeId === classe?.id);
                    if (young) {
                        const contactYoungRow = buildCsvContactRow(young);
                        return {
                            ...contactYoungRow,
                            type: ColumnType["chefs-centres"],
                            PRENOM: chefDeCentre.prenom,
                            NOM: chefDeCentre.nom,
                            EMAIL: chefDeCentre.email,
                            role: chefDeCentre.role,
                        };
                    }
                    return {
                        type: ColumnType["chefs-centres"],
                        PRENOM: chefDeCentre.prenom,
                        NOM: chefDeCentre.nom,
                        EMAIL: chefDeCentre.email,
                        role: chefDeCentre.role,
                    };
                }),
            );
        }

        // Cas COORDINATEURS_CLE
        if (destinataires.includes(DestinataireListeDiffusion.COORDINATEURS_CLE)) {
            this.logger.log(`Cas COORDINATEURS_CLE, campagne: ${campagne.id}`);
            contactsForListeDiffusion.push(
                ...coordinateursCle.map((coordinateurCle) => {
                    const etablissement = etablissements.find((etablissement) =>
                        etablissement.coordinateurIds.includes(coordinateurCle.id),
                    );
                    const classe = classes.find((classe) => classe.etablissementId === etablissement?.id);
                    const young = youngs.hits.find((young) => young.classeId === classe?.id);
                    if (young) {
                        const contactYoungRow = buildCsvContactRow(young);
                        return {
                            ...contactYoungRow,
                            type: ColumnType.administrateurs,
                            PRENOM: coordinateurCle.prenom,
                            NOM: coordinateurCle.nom,
                            EMAIL: coordinateurCle.email,
                            role: coordinateurCle.role,
                        };
                    }
                    return {
                        type: ColumnType.administrateurs,
                        PRENOM: coordinateurCle.prenom,
                        NOM: coordinateurCle.nom,
                        EMAIL: coordinateurCle.email,
                        role: coordinateurCle.role,
                    };
                }),
            );
        }

        if (contactsForListeDiffusion.length === 0) {
            throw new FunctionalException(FunctionalExceptionCode.NO_CONTACTS);
        }

        const csvContacts = await this.fileGateway.generateCSV(contactsForListeDiffusion, {
            headers: COLUMN_CSV_HEADERS,
            delimiter: ";",
        });

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
            sourceFields: ["email", "firstName", "lastName", "meetingPointId", "ligneId", "cohort"],
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
        if (destinataires.includes(DestinataireListeDiffusion.REFERENTS_CLASSES)) {
            contactsQuery.sourceFields?.push("classeId", "etablissementId");
        }

        if (destinataires.includes(DestinataireListeDiffusion.CHEFS_CENTRES)) {
            contactsQuery.sourceFields?.push("cohesionCenterId");
        }

        return contactsQuery;
    }
}
