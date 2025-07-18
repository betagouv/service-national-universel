import { UseCase } from "@shared/core/UseCase";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import {
    ClasseType,
    CohesionCenterType,
    departmentLookUp,
    EtablissementType,
    ExportJeunesTaskParameters,
    formatDateFR,
    formatDateFRTimezoneUTC,
    formatLongDateFR,
    formatPhoneE164,
    getLabelWithdrawnReason,
    isAdmin,
    isInRuralArea,
    isReferentDep,
    isReferentReg,
    isReferentRegDep,
    isResponsableDeCentre,
    isResponsible,
    isSupervisor,
    isVisiteur,
    LigneBusType,
    LigneToPointType,
    MeetingPointType,
    MIME_TYPES,
    ROLES,
    SchoolType,
    SessionPhase1Type,
    translate,
    translateFileStatusPhase1,
    translatePhase1,
    translatePhase2,
    YOUNG_STATUS,
    YoungType,
} from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTemplate, ExportDownloadParams } from "@notification/core/Notification";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { SearchYoungGateway } from "@analytics/core/SearchYoung.gateway";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";
import { CandidatureGateway } from "@admin/core/engagement/candidature/Candidature.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SessionGateway } from "../session/Session.gateway";
import { EXPORT_JEUNE_FOLDER, ExporterJeuneService } from "./ExporterJeune.service";
import { SearchCentreGateway } from "@analytics/core/SearchCentre.gateway";
import { SearchSchoolGateway } from "@analytics/core/SearchSchool.gateway";
import { SearchSejourGateway } from "@analytics/core/SearchSejour.gateway";
import { SearchLigneDeBusGateway } from "@analytics/core/SearchLigneDeBus.gateway";
import { SearchPointDeRassemblementGateway } from "@analytics/core/SearchPointDeRassemblement.gateway";
import { SearchSegmentDeLigneGateway } from "@analytics/core/SearchSegmentDeLigne.gateway";
import { SearchClasseGateway } from "@analytics/core/SearchClasse.gateway";
import { SearchEtablissementGateway } from "@analytics/core/SearchEtablissement.gateway";

export type ExporterJeunesResult = {
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: {
        inscriptionsCount: number;
        errors: number;
    };
};

@Injectable()
export class ExporterJeunes implements UseCase<ExporterJeunesResult> {
    private readonly logger: Logger = new Logger(ExporterJeunes.name);

    constructor(
        @Inject(ExporterJeuneService) private readonly exporterJeuneService: ExporterJeuneService,
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(StructureGateway) private readonly structureGateway: StructureGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(CandidatureGateway) private readonly candidatureGateway: CandidatureGateway,
        @Inject(SearchYoungGateway) private readonly searchYoungGateway: SearchYoungGateway,
        @Inject(SearchSchoolGateway) private readonly searchSchoolGateway: SearchSchoolGateway,
        @Inject(SearchCentreGateway) private readonly searchCentreGateway: SearchCentreGateway,
        @Inject(SearchSejourGateway) private readonly searchSejourGateway: SearchSejourGateway,
        @Inject(SearchLigneDeBusGateway) private readonly searchLigneDeBusGateway: SearchLigneDeBusGateway,
        @Inject(SearchPointDeRassemblementGateway)
        private readonly searchPointDeRassemblementGateway: SearchPointDeRassemblementGateway,
        @Inject(SearchSegmentDeLigneGateway) private readonly searchSegmentDeLigneGateway: SearchSegmentDeLigneGateway,
        @Inject(SearchClasseGateway) private readonly searchClasseGateway: SearchClasseGateway,
        @Inject(SearchEtablissementGateway) private readonly searchEtablissementGateway: SearchEtablissementGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(CryptoGateway) private readonly cryptoGateway: CryptoGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
    ) {}

    async execute({
        format,
        filters: filtersRaw,
        fields,
        searchTerm,
        auteur,
    }: ExportJeunesTaskParameters): Promise<ExporterJeunesResult> {
        this.logger.log(`ExporterJeunes: ${JSON.stringify(fields, null, 2)}`);

        if (!auteur.id) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "aureur.id is required");
        }
        const referent = await this.referentGateway.findById(auteur.id);
        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, `Referent not found: ${auteur.id}`);
        }

        const musts: Record<string, string | string[]> = {};

        const filters = this.exporterJeuneService.getAllowedFilters(filtersRaw, referent);

        if (!isAdmin(auteur)) {
            const defaultStatus = [
                YOUNG_STATUS.WAITING_VALIDATION,
                YOUNG_STATUS.WAITING_CORRECTION,
                YOUNG_STATUS.REFUSED,
                YOUNG_STATUS.VALIDATED,
                YOUNG_STATUS.WITHDRAWN,
                YOUNG_STATUS.WAITING_LIST,
                YOUNG_STATUS.ABANDONED,
                YOUNG_STATUS.REINSCRIPTION,
                ...(isReferentRegDep(auteur) ? [YOUNG_STATUS.IN_PROGRESS] : []),
            ];
            filters.status = filters.status?.length
                ? defaultStatus.filter((status) => filters.status.includes(status))
                : defaultStatus;
        }

        if (isResponsableDeCentre(auteur)) {
            const sejours =
                auteur.role === ROLES.HEAD_CENTER
                    ? await this.sejourGateway.findByHeadCenterId(auteur.id)
                    : await this.sejourGateway.findByAdjointsId(auteur.id);
            if (!sejours.length) {
                throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "Sejour");
            }
            filters.status = [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN];
            filters.sessionPhase1Id = sejours.map((sejour) => sejour.id);

            const visibleCohorts = await this.sessionGateway.findByDateEndAfter(
                this.clockGateway.addMonths(new Date(), -3),
            );
            if (!visibleCohorts.length) {
                throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "No cohort available");
            }
            filters.cohort = visibleCohorts.map((session) => session.nom);
        }

        if (isResponsible(auteur)) {
            if (!referent.structureId) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    "Referent structureId is required",
                );
            }
            const candidatures = await this.candidatureGateway.findByStructureId(referent.structureId);
            musts._id = candidatures.map((candidature) => candidature.jeuneId!);
        }

        if (isSupervisor(auteur)) {
            if (!referent.structureId) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    "Referent structureId is required",
                );
            }
            const structures = await this.structureGateway.findByIdOrNetworkId(referent.structureId);
            const candidatures = await this.candidatureGateway.findByStructureIds(
                structures.map((structure) => structure.id),
            );
            musts._id = candidatures.map((candidature) => candidature.jeuneId!);
        }

        if (isReferentReg(auteur) && filters.schoolRegion !== referent.region) {
            filters.region = referent.region;
        }
        if (isReferentDep(auteur) && filters.schoolDepartment?.[0] !== referent.departement?.[0]) {
            filters.department = referent.departement!;
        }

        if (isVisiteur(auteur)) {
            filters.region = referent.region;
        }

        this.logger.log(`${JSON.stringify({ filters, searchTerm }, null, 2)}`);

        const inscriptions = await this.searchYoungGateway.searchYoung({
            filters,
            musts,
            searchTerm: searchTerm ? { value: searchTerm, fields: [] } : undefined,
            full: true,
            sortField: "lastName.keyword",
            sortOrder: "asc",
        });

        this.logger.log(`jeunes count: ${inscriptions.hits.length}`);

        const excelData = await this.generateRapport(inscriptions.hits, fields, auteur, format);

        this.logger.log(`Generate excel`);
        // création du fichier excel de rapport
        const fileBuffer = await this.fileGateway.generateExcelFromValues({
            ...excelData,
            sheetName: "data",
        });

        this.logger.log(`Upload excel`);
        // upload du rapport du s3
        const timestamp = this.clockGateway.formatSafeDateTime(new Date());
        const fileName = `${format}s_${this.cryptoGateway.getUuid()}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `${EXPORT_JEUNE_FOLDER}/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
            { ACL: "public-read" },
        );

        // envoi de l'email à celui qui a demandé l'export
        await this.notificationGateway.sendEmail<ExportDownloadParams>(
            {
                to: [{ email: referent.email, name: `${referent.prenom} ${referent.nom}` }],
                url: this.fileGateway.getFileUrlFromKey(rapportFile.Key),
            },
            EmailTemplate.EXPORT_DOWNLOAD,
        );

        return {
            rapportFile,
            analytics: {
                inscriptionsCount: inscriptions.hits.length,
                errors: 0,
            },
        };
    }

    async generateRapport(
        jeunes: YoungType[],
        selectedFields: string[],
        auteur: ExportJeunesTaskParameters["auteur"],
        format: ExportJeunesTaskParameters["format"],
    ) {
        let updatedJeunes = jeunes;

        let schoolsById: Record<string, Partial<SchoolType>> = {};
        let centersById: Record<string, Partial<CohesionCenterType>> = {};
        let sessionPhase1sById: Record<string, Partial<SessionPhase1Type>> = {};
        let lignesBusById: Record<string, Partial<LigneBusType>> = {};
        let meetingPointsById: Record<string, Partial<MeetingPointType>> = {};
        let lignesToPointById: Record<string, Partial<LigneToPointType>> = {};
        let classesById: Record<string, Partial<ClasseType>> = {};
        let etablissementsById: Record<string, Partial<EtablissementType>> = {};

        //School
        if (selectedFields.includes("schoolSituation")) {
            schoolsById = await this.retrieveSchools(jeunes);
        }

        //center
        if (selectedFields.includes("phase1Affectation")) {
            centersById = await this.retrieveCenters(jeunes);
        }

        // sessionPhase1
        if (selectedFields.includes("sessionPhase1Id")) {
            sessionPhase1sById = await this.retrieveSessionPhase1s(jeunes);
        }

        //full info bus
        if (selectedFields.includes("phase1Transport")) {
            const ligneInfos = await this.retrieveLignesBus(jeunes);
            lignesBusById = ligneInfos.lignesBusById;
            meetingPointsById = ligneInfos.meetingPointsById;
            lignesToPointById = ligneInfos.lignesToPointById;
        }

        if (selectedFields.includes("cle")) {
            classesById = await this.retrieveClasses(jeunes);
            etablissementsById = await this.retrieveEtablissements(jeunes);
        }

        const result: any[] = [];
        updatedJeunes.forEach((jeune, index) => {
            if (index % 1000 === 0) {
                this.logger.log(`mapping ${format} ${index}/${updatedJeunes.length}`);
            }

            if (jeune.schoolId) {
                // @ts-ignore
                jeune.school = schoolsById[jeune.schoolId];
            }
            if (jeune.classeId) {
                // @ts-ignore
                jeune.classe = classesById[jeune.classeId];
            }
            if (jeune.etablissementId) {
                // @ts-ignore
                jeune.etablissement = etablissementsById[jeune.etablissementId];
            }
            if (jeune.sessionPhase1Id) {
                // @ts-ignore
                jeune.sessionPhase1 = sessionPhase1sById[jeune.sessionPhase1Id];
            }
            if (jeune.cohesionCenterId) {
                // @ts-ignore
                jeune.center = centersById[jeune.cohesionCenterId];
            }
            if (jeune.ligneId) {
                // @ts-ignore
                jeune.bus = lignesBusById[jeune.ligneId];
                // @ts-ignore
                jeune.meetingPoint = meetingPointsById[jeune.meetingPointId];
                // @ts-ignore
                jeune.ligneToPoint = lignesToPointById[`${jeune.meetingPointId}_${jeune.ligneId}`];
            }
            // @ts-ignore
            jeune.emailDeConnexion = jeune.email;

            const mappedJeune =
                format === "volontaire"
                    ? this.mapVolontaire(jeune, selectedFields, auteur)
                    : this.mapInscription(jeune, selectedFields, auteur);
            result.push(mappedJeune);
        });

        this.logger.log(`result ${result.length}`);

        return {
            columnsName: result.length ? Object.keys(result[0]) : [],
            values: result.map((item) => Object.values(item)),
        };
    }

    async retrieveSchools(jeunes: YoungType[]) {
        const schoolsById: Record<string, Partial<SchoolType>> = jeunes.reduce(
            (acc, jeune) => {
                if (jeune.schoolId) {
                    acc[jeune.schoolId] = { _id: jeune.schoolId };
                }
                return acc;
            },
            {} as Record<string, Partial<SchoolType>>,
        );
        const nbSchools = Object.keys(schoolsById).length;
        this.logger.log(`school count: ${nbSchools}`);
        if (nbSchools === 0) {
            return {};
        }

        // search schools data
        const schools = await this.searchSchoolGateway.searchSchool({
            musts: { ids: Object.keys(schoolsById) },
            full: true,
        });
        this.logger.log(`schools search count: ${schools.hits.length}`);
        if (schools.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbSchools: ${nbSchools} !== searchCount: ${schools.hits.length}`,
            );
        }
        schools.hits.forEach((school) => {
            schoolsById[school._id] = school;
        });

        return schoolsById;
    }

    async retrieveCenters(jeunes: YoungType[]) {
        const centersById: Record<string, Partial<CohesionCenterType>> = jeunes.reduce(
            (acc, jeune) => {
                if (jeune.cohesionCenterId) {
                    acc[jeune.cohesionCenterId] = { _id: jeune.cohesionCenterId };
                }
                return acc;
            },
            {} as Record<string, Partial<CohesionCenterType>>,
        );
        const nbCenters = Object.keys(centersById).length;
        this.logger.log(`center count: ${nbCenters}`);
        if (nbCenters === 0) {
            return {};
        }

        // search centers data
        const centers = await this.searchCentreGateway.searchCentre({
            musts: { ids: Object.keys(centersById) },
            full: true,
        });
        this.logger.log(`centers search count: ${centers.hits.length}`);
        if (centers.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbCenters: ${nbCenters} !== searchCount: ${centers.hits.length}`,
            );
        }
        centers.hits.forEach((center) => {
            centersById[center._id] = center;
        });

        return centersById;
    }

    async retrieveSessionPhase1s(jeunes: YoungType[]) {
        const sessionPhase1sById: Record<string, Partial<SessionPhase1Type>> = jeunes.reduce(
            (acc, jeune) => {
                if (jeune.sessionPhase1Id) {
                    acc[jeune.sessionPhase1Id] = { _id: jeune.sessionPhase1Id };
                }
                return acc;
            },
            {} as Record<string, Partial<SessionPhase1Type>>,
        );
        const nbSessionPhase1s = Object.keys(sessionPhase1sById).length;
        this.logger.log(`sessionPhase1 count: ${nbSessionPhase1s}`);
        if (nbSessionPhase1s === 0) {
            return {};
        }
        // search sessionPhase1s data
        const sessionPhase1s = await this.searchSejourGateway.searchSejour({
            filters: { cohesionCenterId: Object.keys(sessionPhase1sById) },
            full: true,
        });
        this.logger.log(`sessionPhase1s search count: ${sessionPhase1s.hits.length}`);
        if (sessionPhase1s.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbSessionPhase1s: ${nbSessionPhase1s} !== searchCount: ${sessionPhase1s.hits.length}`,
            );
        }
        sessionPhase1s.hits.forEach((sessionPhase1) => {
            sessionPhase1sById[sessionPhase1._id] = sessionPhase1;
        });

        return sessionPhase1sById;
    }

    async retrieveLignesBus(jeunes: YoungType[]) {
        // search lignesBus data
        const lignesBusById: Record<string, Partial<LigneBusType>> = jeunes.reduce(
            (acc, jeune) => {
                if (jeune.ligneId) {
                    acc[jeune.ligneId] = { _id: jeune.ligneId };
                }
                return acc;
            },
            {} as Record<string, Partial<LigneBusType>>,
        );
        const nbLignesBus = Object.keys(lignesBusById).length;
        this.logger.log(`lignesBus count: ${nbLignesBus}`);
        if (nbLignesBus === 0) {
            return { lignesBusById: {}, meetingPointsById: {}, lignesToPointById: {} };
        }
        const lignesBus = await this.searchLigneDeBusGateway.searchLigneDeBus({
            musts: { ids: Object.keys(lignesBusById) },
            full: true,
        });
        this.logger.log(`lignesBus search count: ${lignesBus.hits.length}`);
        if (lignesBus.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbLignesBus: ${nbLignesBus} !== searchCount: ${lignesBus.hits.length}`,
            );
        }
        lignesBus.hits.forEach((ligneBus) => {
            lignesBusById[ligneBus._id] = ligneBus;
        });

        // get meetingPoints
        const meetingPointsById: Record<string, Partial<MeetingPointType>> = lignesBus.hits.reduce(
            (acc, ligneBus) => {
                if (ligneBus.meetingPointsIds) {
                    for (const meetingPointId of ligneBus.meetingPointsIds) {
                        if (meetingPointId) {
                            acc[meetingPointId] = { _id: meetingPointId };
                        }
                    }
                }
                return acc;
            },
            {} as Record<string, Partial<MeetingPointType>>,
        );
        const lignesToPointById: Record<string, Partial<LigneToPointType>> = {};

        const nbMeetingPoints = Object.keys(meetingPointsById).length;
        this.logger.log(`meetingPoints count: ${nbMeetingPoints}`);
        if (nbMeetingPoints !== 0) {
            const meetingPoints = await this.searchPointDeRassemblementGateway.searchPointDeRassemblement({
                musts: { ids: Object.keys(meetingPointsById) },
                existingFields: ["matricule"],
                full: true,
            });
            this.logger.log(`meetingPoints search count: ${meetingPoints.hits.length}`);
            if (meetingPoints.hits.length === 0) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    `nbMeetingPoints: ${nbMeetingPoints} !== searchCount: ${meetingPoints.hits.length}`,
                );
            }
            meetingPoints.hits.forEach((meetingPoint) => {
                meetingPointsById[meetingPoint._id] = meetingPoint;
            });
            // get lignesToPoint
            const lignesToPoint = await this.searchSegmentDeLigneGateway.searchSegmentDeLigne({
                filters: { meetingPointId: Object.keys(meetingPointsById) },
                full: true,
            });
            this.logger.log(`lignesToPoint search count: ${lignesToPoint.hits.length}`);
            lignesToPoint.hits.forEach((ligneToPoint) => {
                lignesToPointById[`${ligneToPoint.meetingPointId}_${ligneToPoint.lineId}`] = ligneToPoint;
            });
        }

        return { lignesBusById, meetingPointsById, lignesToPointById };
    }

    async retrieveClasses(jeunes: YoungType[]) {
        const classesById: Record<string, Partial<ClasseType>> = jeunes.reduce(
            (acc, jeune) => {
                if (jeune.classeId) {
                    acc[jeune.classeId] = { _id: jeune.classeId };
                }
                return acc;
            },
            {} as Record<string, Partial<ClasseType>>,
        );
        const nbClasses = Object.keys(classesById).length;
        this.logger.log(`class count: ${nbClasses}`);
        if (nbClasses === 0) {
            return {};
        }
        // search classes data
        const classes = await this.searchClasseGateway.searchClasse({
            musts: { ids: Object.keys(classesById) },
            full: true,
        });
        this.logger.log(`classes search count: ${classes.hits.length}`);
        if (classes.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbClasses: ${nbClasses} !== searchCount: ${classes.hits.length}`,
            );
        }
        classes.hits.forEach((classe) => {
            classesById[classe._id] = classe;
        });

        return classesById;
    }

    async retrieveEtablissements(jeunes: YoungType[]) {
        const etablissementsById: Record<string, Partial<EtablissementType>> = jeunes.reduce(
            (acc, jeune) => {
                if (jeune.etablissementId) {
                    acc[jeune.etablissementId] = { _id: jeune.etablissementId };
                }
                return acc;
            },
            {} as Record<string, Partial<EtablissementType>>,
        );
        const nbEtablissements = Object.keys(etablissementsById).length;
        this.logger.log(`etablissements count: ${nbEtablissements}`);
        if (nbEtablissements === 0) {
            return {};
        }
        // search etablissements data
        const etablissements = await this.searchEtablissementGateway.searchEtablissement({
            musts: { ids: Object.keys(etablissementsById) },
            full: true,
        });
        this.logger.log(`etablissements search count: ${etablissements.hits.length}`);
        if (etablissements.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbEtablissements: ${nbEtablissements} !== searchCount: ${etablissements.hits.length}`,
            );
        }
        etablissements.hits.forEach((etablissement) => {
            etablissementsById[etablissement._id] = etablissement;
        });

        return etablissementsById;
    }

    mapInscription(jeune: YoungType, selectedFields: string[], auteur: ExportJeunesTaskParameters["auteur"]) {
        return {
            _id: jeune._id,
            Cohorte: jeune.cohort,
            Prénom: jeune.firstName,

            Nom: jeune.lastName,
            "Date de naissance": formatDateFRTimezoneUTC(jeune.birthdateAt),
            "Pays de naissance": jeune.birthCountry || "France",
            "Ville de naissance": jeune.birthCity,
            "Code postal de naissance": jeune.birthCityZip,
            "Date de fin de validité de la pièce d'identité": formatDateFRTimezoneUTC(
                jeune?.latestCNIFileExpirationDate,
            ),
            Sexe: translate(jeune.gender),
            Email: jeune.email,
            Téléphone: formatPhoneE164(jeune.phone, jeune.phoneZone),
            "Adresse postale": jeune.address,
            "Code postal": jeune.zip,
            Ville: jeune.city,
            Département: jeune.department,
            Région: jeune.region,
            Académie: jeune.academy,
            Pays: jeune.country,
            "Nom de l'hébergeur": jeune.hostLastName,
            "Prénom de l'hébergeur": jeune.hostFirstName,
            "Lien avec l'hébergeur": jeune.hostRelationship,
            "Adresse - étranger": jeune.foreignAddress,
            "Code postal - étranger": jeune.foreignZip,
            "Ville - étranger": jeune.foreignCity,
            "Pays - étranger": jeune.foreignCountry,
            Situation: translate(jeune.situation),
            Niveau: jeune.grade,
            // @ts-ignore
            "Type d'établissement": translate(jeune.school?.type || jeune.schoolType),
            // @ts-ignore
            "Nom de l'établissement": jeune.school?.fullName || jeune.schoolName,
            // @ts-ignore
            "Code postal de l'établissement": jeune.school?.postcode || jeune.schoolZip,
            // @ts-ignore
            "Ville de l'établissement": jeune.school?.city || jeune.schoolCity,
            "Département de l'établissement":
                // @ts-ignore
                departmentLookUp[jeune.school?.department] || jeune.schoolDepartment,
            // @ts-ignore
            "UAI de l'établissement": jeune.school?.uai,
            "Quartier Prioritaire de la ville": translate(jeune.qpv),
            "Zone Rurale": translate(isInRuralArea(jeune)),
            Handicap: translate(jeune.handicap),
            "Bénéficiaire d'un PPS": translate(jeune.ppsBeneficiary),
            "Bénéficiaire d'un PAI": translate(jeune.paiBeneficiary),
            "Structure médico-sociale": translate(jeune.medicosocialStructure),
            "Nom de la structure médico-sociale": jeune.medicosocialStructureName,
            "Adresse de la structure médico-sociale": jeune.medicosocialStructureAddress,
            "Code postal de la structure médico-sociale": jeune.medicosocialStructureZip,
            "Ville de la structure médico-sociale": jeune.medicosocialStructureCity,
            "Aménagement spécifique": translate(jeune.specificAmenagment),
            "Nature de l'aménagement spécifique": jeune.specificAmenagmentType,
            "Aménagement pour mobilité réduite": translate(jeune.reducedMobilityAccess),
            "Besoin d'être affecté(e) dans le département de résidence": translate(jeune.handicapInSameDepartment),
            "Allergies ou intolérances alimentaires": translate(jeune.allergies),
            "Activité de haut-niveau": translate(jeune.highSkilledActivity),
            "Nature de l'activité de haut-niveau": jeune.highSkilledActivityType,
            "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(
                jeune.highSkilledActivityInSameDepartment,
            ),
            "Document activité de haut-niveau ": jeune.highSkilledActivityProofFiles,
            "Consentement des représentants légaux": translate(jeune.parentConsentment),
            "Droit à l'image": translate(jeune.imageRight),
            "Autotest PCR": translate(jeune.autoTestPCR),
            "Règlement intérieur": translate(jeune.rulesYoung),
            "Fiche sanitaire réceptionnée": translate(jeune.cohesionStayMedicalFileReceived) || "Non Renseigné",
            PSC1: translate(jeune.psc1Info) || "Non Renseigné",
            "Remboursement Code de la Route": translate(jeune.roadCodeRefund) || "Non renseigné",
            "Statut représentant légal 1": translate(jeune.parent1Status),
            "Prénom représentant légal 1": jeune.parent1FirstName,
            "Nom représentant légal 1": jeune.parent1LastName,
            "Email représentant légal 1": jeune.parent1Email,
            "Téléphone représentant légal 1": formatPhoneE164(jeune.parent1Phone, jeune.parent1PhoneZone),
            "Adresse représentant légal 1": jeune.parent1Address,
            "Code postal représentant légal 1": jeune.parent1Zip,
            "Ville représentant légal 1": jeune.parent1City,
            "Département représentant légal 1": jeune.parent1Department,
            "Région représentant légal 1": jeune.parent1Region,
            "Statut représentant légal 2": translate(jeune.parent2Status),
            "Prénom représentant légal 2": jeune.parent2FirstName,
            "Nom représentant légal 2": jeune.parent2LastName,
            "Email représentant légal 2": jeune.parent2Email,
            "Téléphone représentant légal 2": formatPhoneE164(jeune.parent2Phone, jeune.parent2PhoneZone),
            "Adresse représentant légal 2": jeune.parent2Address,
            "Code postal représentant légal 2": jeune.parent2Zip,
            "Ville représentant légal 2": jeune.parent2City,
            "Département représentant légal 2": jeune.parent2Department,
            "Région représentant légal 2": jeune.parent2Region,
            Motivation: jeune.motivations,
            Phase: translate(jeune.phase),
            "Créé lé": formatLongDateFR(jeune.createdAt),
            "Mis à jour le": formatLongDateFR(jeune.updatedAt),
            "Dernière connexion le": formatLongDateFR(jeune.lastLoginAt),
            "Statut général": translate(jeune.status),
            "Statut Phase 1": translatePhase1(jeune.statusPhase1),
            "Statut Phase 2": translatePhase2(jeune.statusPhase2),
            "Dernier statut le": formatLongDateFR(jeune.lastStatusAt),
            "Email de connexion": jeune.email,
        };
    }

    mapVolontaire(jeune: YoungType, selectedFields: string[], auteur: ExportJeunesTaskParameters["auteur"]) {
        let center = {} as CohesionCenterType;
        if (jeune.cohesionCenterId && jeune.sessionPhase1Id) {
            // @ts-ignore
            center = jeune?.center || {};
        }
        let meetingPoint = {} as MeetingPointType;
        let bus = {} as LigneBusType;
        let ligneToPoint = {} as LigneToPointType;
        if (jeune.meetingPointId && jeune.ligneId) {
            // @ts-ignore
            bus = jeune?.bus || {};
            // @ts-ignore
            ligneToPoint = jeune?.ligneToPoint || {};
            // @ts-ignore
            meetingPoint = jeune?.meetingPoint || {};
        }
        let classe = {} as ClasseType;
        let etablissement = {} as EtablissementType;
        if (jeune.classeId) {
            // @ts-ignore
            classe = jeune?.classe || {};
        }
        if (jeune.etablissementId) {
            // @ts-ignore
            etablissement = jeune?.etablissement || {};
        }

        if (!jeune.domains) jeune.domains = [];
        if (!jeune.periodRanking) jeune.periodRanking = [];
        const allFields = {
            emailDeConnexion: {
                // @ts-ignore
                "Email de connexion": jeune.emailDeConnexion,
            },
            psc1Info: {
                PSC1: translate(jeune?.psc1Info) || "Non renseigné",
            },
            identity: {
                Prénom: jeune.firstName,
                Nom: jeune.lastName,
                Sexe: translate(jeune.gender),
                Cohorte: jeune.cohort,
                "Cohorte d'origine": jeune.originalCohort,
            },
            contact: {
                Email: jeune.email,
                Téléphone: formatPhoneE164(jeune.phone, jeune.phoneZone),
            },
            birth: {
                "Date de naissance": formatDateFRTimezoneUTC(jeune.birthdateAt),
                "Pays de naissance": jeune.birthCountry || "France",
                "Ville de naissance": jeune.birthCity,
                "Code postal de naissance": jeune.birthCityZip,
                "Date de fin de validité de la pièce d'identité": formatDateFRTimezoneUTC(
                    jeune?.latestCNIFileExpirationDate,
                ),
            },
            address: {
                "Adresse postale": jeune.address,
                "Code postal": jeune.zip,
                Ville: jeune.city,
                Pays: jeune.country,
                "Nom de l'hébergeur": jeune.hostLastName,
                "Prénom de l'hébergeur": jeune.hostFirstName,
                "Lien avec l'hébergeur": jeune.hostRelationship,
                "Adresse - étranger": jeune.foreignAddress,
                "Code postal - étranger": jeune.foreignZip,
                "Ville - étranger": jeune.foreignCity,
                "Pays - étranger": jeune.foreignCountry,
            },
            location: {
                Département: jeune.department,
                Académie: jeune.academy,
                Région: jeune.region,
            },
            schoolSituation: {
                Situation: translate(jeune.situation),
                Niveau: translate(jeune.grade),
                // @ts-ignore
                "Type d'établissement": translate(jeune.school?.type || jeune.schoolType),
                // @ts-ignore
                "Nom de l'établissement": jeune.school?.fullName || jeune.schoolName,
                // @ts-ignore
                "Code postal de l'établissement": jeune.school?.postcode || jeune.schoolZip,
                // @ts-ignore
                "Ville de l'établissement": jeune.school?.city || jeune.schoolCity,
                "Département de l'établissement":
                    // @ts-ignore
                    departmentLookUp[jeune.school?.department || ""] || jeune.schoolDepartment,
                // @ts-ignore
                "UAI de l'établissement": jeune.school?.uai,
            },
            situation: {
                "Quartier Prioritaire de la ville": translate(jeune.qpv),
                "Zone Rurale": translate(isInRuralArea(jeune)),
                Handicap: translate(jeune.handicap),
                "Bénéficiaire d'un PPS": translate(jeune.ppsBeneficiary),
                "Bénéficiaire d'un PAI": translate(jeune.paiBeneficiary),
                "Aménagement spécifique": translate(jeune.specificAmenagment),
                "Nature de l'aménagement spécifique": translate(jeune.specificAmenagmentType),
                "Aménagement pour mobilité réduite": translate(jeune.reducedMobilityAccess),
                "Besoin d'être affecté(e) dans le département de résidence": translate(jeune.handicapInSameDepartment),
                "Allergies ou intolérances alimentaires": translate(jeune.allergies),
                "Activité de haut-niveau": translate(jeune.highSkilledActivity),
                "Nature de l'activité de haut-niveau": jeune.highSkilledActivityType,
                "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(
                    jeune.highSkilledActivityInSameDepartment,
                ),
                "Document activité de haut-niveau ": jeune.highSkilledActivityProofFiles,
                "Structure médico-sociale": translate(jeune.medicosocialStructure),
                "Nom de la structure médico-sociale": jeune.medicosocialStructureName,
                "Adresse de la structure médico-sociale": jeune.medicosocialStructureAddress,
                "Code postal de la structure médico-sociale": jeune.medicosocialStructureZip,
                "Ville de la structure médico-sociale": jeune.medicosocialStructureCity,
            },
            cle: {
                "Nationalité française": translate(jeune.frenchNationality),
                "Etablissement UAI": etablissement?.uai,
                "Classe Engagée ID": jeune.classeId,
                Coloration: translate(classe?.coloration),
            },
            representative1: {
                "Statut représentant légal 1": translate(jeune.parent1Status),
                "Prénom représentant légal 1": jeune.parent1FirstName,
                "Nom représentant légal 1": jeune.parent1LastName,
                "Email représentant légal 1": jeune.parent1Email,
                "Téléphone représentant légal 1": formatPhoneE164(jeune.parent1Phone, jeune.parent1PhoneZone),
                "Adresse représentant légal 1": jeune.parent1Address,
                "Code postal représentant légal 1": jeune.parent1Zip,
                "Ville représentant légal 1": jeune.parent1City,
                "Département représentant légal 1": jeune.parent1Department,
                "Région représentant légal 1": jeune.parent1Region,
            },
            representative2: {
                "Statut représentant légal 2": translate(jeune.parent2Status),
                "Prénom représentant légal 2": jeune.parent2FirstName,
                "Nom représentant légal 2": jeune.parent2LastName,
                "Email représentant légal 2": jeune.parent2Email,
                "Téléphone représentant légal 2": formatPhoneE164(jeune.parent2Phone, jeune.parent2PhoneZone),
                "Adresse représentant légal 2": jeune.parent2Address,
                "Code postal représentant légal 2": jeune.parent2Zip,
                "Ville représentant légal 2": jeune.parent2City,
                "Département représentant légal 2": jeune.parent2Department,
                "Région représentant légal 2": jeune.parent2Region,
            },
            consent: {
                "Consentement des représentants légaux": translate(jeune.parentConsentment),
            },
            status: {
                "Statut général": translate(jeune.status),
                Phase: translate(jeune.phase),
                "Statut Phase 1": translatePhase1(jeune.statusPhase1),
                "Statut Phase 2": translatePhase2(jeune.statusPhase2),
                "Statut Phase 3": translate(jeune.statusPhase3),
                "Dernier statut le": formatLongDateFR(jeune.lastStatusAt),
            },
            phase1Affectation: {
                "ID centre": center._id || "",
                "Matricule centre": center.matricule || "",
                "Code centre (2022)": center.code2022 || "",
                "Nom du centre": center.name || "",
                "Ville du centre": center.city || "",
                "Département du centre": center.department || "",
                "Région du centre": center.region || "",
            },
            phase1Transport: {
                "Se rend au centre par ses propres moyens": translate(jeune.deplacementPhase1Autonomous),
                "Informations de transports transmises par email": translate(jeune.transportInfoGivenByLocal),
                "Bus n˚": bus?.busId,
                // @ts-ignore
                "Nom du point de rassemblement": meetingPoint?.name,
                // @ts-ignore
                "Adresse point de rassemblement": meetingPoint?.address,
                // @ts-ignore
                "Ville du point de rassemblement": meetingPoint?.city,
                "Date aller": formatDateFR(bus?.departuredDate),
                "Heure de départ": ligneToPoint?.departureHour,
                "Heure de convocation": ligneToPoint?.meetingHour,
                "Date retour": formatDateFR(bus?.returnDate),
                "Heure de retour": ligneToPoint?.returnHour,
                "Voyage en avion": translate(jeune?.isTravelingByPlane),
            },
            phase1DocumentStatus: {
                "Droit à l'image - Statut": translateFileStatusPhase1(jeune.imageRightFilesStatus) || "Non Renseigné",
                "Autotest PCR - Statut": translateFileStatusPhase1(jeune.autoTestPCRFilesStatus) || "Non Renseigné",
                "Règlement intérieur": translate(jeune.rulesYoung),
                "Fiche sanitaire réceptionnée": translate(jeune.cohesionStayMedicalFileReceived) || "Non Renseigné",
            },
            phase1DocumentAgreement: {
                "Droit à l'image - Accord": translate(jeune.imageRight),
                "Autotest PCR - Accord": translate(jeune.autoTestPCR),
            },
            phase1Attendance: {
                "Présence à l'arrivée": !jeune.cohesionStayPresence
                    ? "Non renseignée"
                    : jeune.cohesionStayPresence === "true"
                      ? "Présent"
                      : "Absent",
                "Présence à la JDM": !jeune.presenceJDM
                    ? "Non renseignée"
                    : jeune.presenceJDM === "true"
                      ? "Présent"
                      : "Absent",
                "Date de départ": !jeune.departSejourAt
                    ? "Non renseignée"
                    : formatDateFRTimezoneUTC(jeune.departSejourAt),
                "Motif du départ": jeune?.departSejourMotif,
                "Commentaire du départ": jeune?.departSejourMotifComment,
            },
            phase2: {
                "Domaine de MIG 1": jeune.domains[0],
                "Domaine de MIG 2": jeune.domains[1],
                "Domaine de MIG 3": jeune.domains[2],
                "Projet professionnel": translate(jeune.professionnalProject),
                "Information supplémentaire sur le projet professionnel": jeune.professionnalProjectPrecision,
                "Période privilégiée pour réaliser des missions": jeune.period,
                "Choix 1 période": translate(jeune.periodRanking[0]),
                "Choix 2 période": translate(jeune.periodRanking[1]),
                "Choix 3 période": translate(jeune.periodRanking[2]),
                "Choix 4 période": translate(jeune.periodRanking[3]),
                "Choix 5 période": translate(jeune.periodRanking[4]),
                "Mobilité aux alentours de son établissement": translate(jeune.mobilityNearSchool),
                "Mobilité aux alentours de son domicile": translate(jeune.mobilityNearHome),
                "Mobilité aux alentours d'un de ses proches": translate(jeune.mobilityNearRelative),
                "Informations du proche":
                    jeune.mobilityNearRelative &&
                    [
                        jeune.mobilityNearRelativeName,
                        jeune.mobilityNearRelativeAddress,
                        jeune.mobilityNearRelativeZip,
                        jeune.mobilityNearRelativeCity,
                    ]
                        .filter((e) => e)
                        ?.join(", "),
                "Mode de transport": jeune.mobilityTransport?.map((t) => translate(t)).join(", "),
                "Autre mode de transport": jeune.mobilityTransportOther,
                "Format de mission": translate(jeune.missionFormat),
                "Engagement dans une structure en dehors du SNU": translate(jeune.engaged),
                "Description engagement ": jeune.engagedDescription,
                "Souhait MIG": jeune.desiredLocation,
                "Remboursement Code de la Route": translate(jeune?.roadCodeRefund) || "Non renseigné",
            },
            accountDetails: {
                "Créé lé": formatLongDateFR(jeune.createdAt),
                "Mis à jour le": formatLongDateFR(jeune.updatedAt),
                "Dernière connexion le": formatLongDateFR(jeune.lastLoginAt),
            },
            desistement: {
                "Raison du désistement": getLabelWithdrawnReason(jeune.withdrawnReason),
                "Message de désistement": jeune.withdrawnMessage,
            },
        };

        const fields: { [key: string]: string | undefined } = { ID: jeune._id };
        for (const element of selectedFields) {
            let key: string;
            for (key in allFields[element]) fields[key] = allFields[element][key];
        }
        return fields;
    }
}
