import { UseCase } from "@shared/core/UseCase";
import { Inject, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import {
    ApplicationType,
    ExportMissionCandidaturesTaskParameters,
    formatDateFRTimezoneUTC,
    formatLongDateFR,
    formatLongDateUTC,
    MIME_TYPES,
    missionCandidatureExportFields,
    MissionType,
    ROLES,
    translate,
    translateApplication,
    translatePhase2,
    YoungType,
} from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { SearchApplicationGateway } from "@analytics/core/SearchApplication.gateway";
import { SearchYoungGateway } from "@analytics/core/SearchYoung.gateway";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTemplate, ExportMissionsParams } from "@notification/core/Notification";
import { ExportMissionService } from "./ExportMission.service";

export type ExporterMissionCanditaturesResult = {
    rapportFile: {
        Location: string;
        ETag: string;
        Bucket: string;
        Key: string;
    };
    analytics: {
        missionsCount: number;
        errors: number;
    };
};

const optionsType = ["contractAvenantFiles", "justificatifsFiles", "feedBackExperienceFiles", "othersFiles"];

export class ExporterMissionCanditatures implements UseCase<ExporterMissionCanditaturesResult> {
    constructor(
        private readonly exportMissionService: ExportMissionService,
        @Inject(SearchApplicationGateway) private readonly searchApplicationGateway: SearchApplicationGateway,
        @Inject(SearchYoungGateway) private readonly searchYoungGateway: SearchYoungGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(CryptoGateway) private readonly cryptoGateway: CryptoGateway,
        private readonly logger: Logger,
    ) {}

    async execute({
        filters,
        fields,
        searchTerm,
        auteur,
    }: ExportMissionCandidaturesTaskParameters): Promise<ExporterMissionCanditaturesResult> {
        this.logger.log(
            `ExporterMissionCanditatures: ${JSON.stringify(fields, null, 2)}`,
            ExporterMissionCanditatures.name,
        );

        const { missions, referent } = await this.exportMissionService.searchMissions({
            fields,
            filters,
            searchTerm,
            auteur,
        });

        this.logger.log(`missions count: ${missions.hits.length}`, ExporterMissionCanditatures.name);

        const excelData = await this.generateRapport(missions.hits, fields, filters, auteur);

        this.logger.log(`Generate excel`, ExporterMissionCanditatures.name);
        // création du fichier excel de rapport
        const fileBuffer = await this.fileGateway.generateExcelFromValues({
            ...excelData,
            sheetName: "data",
        });

        this.logger.log(`Upload excel`, ExporterMissionCanditatures.name);
        // upload du rapport du s3
        const timestamp = this.clockGateway.formatSafeDateTime(new Date());
        const fileName = `missions_candidatures_${this.cryptoGateway.getUuid()}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/engagement/mission/${fileName}`,
            {
                data: fileBuffer,
                mimetype: MIME_TYPES.EXCEL,
            },
            { ACL: "public-read" },
        );

        // envoi de l'email à celui qui a demandé l'export
        await this.notificationGateway.sendEmail<ExportMissionsParams>(
            {
                to: [{ email: referent.email, name: `${referent.prenom} ${referent.nom}` }],
                url: rapportFile.Location,
            },
            EmailTemplate.EXPORT_MISSION_CANDIDATURES,
        );

        return {
            rapportFile,
            analytics: {
                missionsCount: missions.hits.length,
                errors: 0,
            },
        };
    }

    async generateRapport(
        missions: MissionType[],
        selectedFields: string[],
        filters: Record<string, string | string[]>,
        auteur: ExportMissionCandidaturesTaskParameters["auteur"],
    ) {
        if (missions.length === 0) {
            return {
                columnsName: [],
                values: [],
            };
        }
        let updatedMissions = missions;

        const youngCategorie = [
            "representative2",
            "representative1",
            "location",
            "address",
            "imageRight",
            "contact",
            "identity",
            "status",
        ];

        if ([...youngCategorie, "application"].some((category) => selectedFields.includes(category))) {
            // Export des candidatures
            const missionIds = [
                ...new Set(missions.map((mission) => mission._id.toString()).filter((missionId) => missionId)),
            ];

            const candidatures = await this.searchApplicationGateway.searchApplication({
                filters: { missionId: missionIds, status: filters.applicationStatus },
                sourceFields: missionCandidatureExportFields.find((f) => f.id === "application")?.fields,
                full: true,
            });

            this.logger.log(`candidatures count: ${candidatures.hits.length}`, ExporterMissionCanditatures.name);

            if (candidatures?.hits?.length) {
                updatedMissions = await this.populateCandidatures(updatedMissions, candidatures.hits);
            } else {
                updatedMissions = updatedMissions.map((item) => ({ ...item, candidatures: [] }));
            }
        }
        updatedMissions = updatedMissions.filter((data) => data.candidatures?.length);

        let result: any[] = [];
        updatedMissions.forEach((mission, index) => {
            if (index % 1000 === 0) {
                this.logger.log(`mapping ${index}/${updatedMissions.length}`, ExporterMissionCanditatures.name);
            }
            if (!mission.structure) {
                // @ts-ignore
                mission.structure = {
                    name: "",
                    legalStatus: "",
                    types: [],
                    sousType: "",
                    description: "",
                    address: "",
                    zip: "",
                    city: "",
                    department: "",
                    region: "",
                };
            }
            return mission?.candidatures?.map((candidature) => {
                const mappedCandidature = this.mapCandidature(mission, candidature, selectedFields, auteur);
                result = [...result, mappedCandidature];
            });
        });
        this.logger.log(`result ${result.length}`, ExporterMissionCanditatures.name);

        return {
            columnsName: Object.keys(result[0]),
            values: result.map((item) => Object.values(item)),
        };
    }

    async populateCandidatures(missions: MissionType[], candidatures: ApplicationType[]): Promise<MissionType[]> {
        const condidaturesByMissionId = candidatures.reduce(
            (acc, candidature) => {
                if (candidature.missionId) {
                    acc[candidature.missionId] = [...(acc[candidature.missionId] || []), candidature];
                }
                return acc;
            },
            {} as Record<string, any[]>,
        );

        missions = missions.map((mission) => ({
            ...mission,
            candidatures: condidaturesByMissionId[mission._id] || [],
        }));

        const youngsById = await this.retrieveYoungs(candidatures);
        const tutorsById = await this.exportMissionService.retrieveTutors(missions);
        const structuresById = await this.exportMissionService.retrieveStructures(missions);

        this.logger.log(`ajout info jeunes`, ExporterMissionCanditatures.name);
        // Add young info
        return missions.map((mission) => {
            if (mission.candidatures?.length) {
                if (mission.tutorId) {
                    // @ts-ignore
                    mission.tutor = tutorsById[mission.tutorId!];
                }
                if (mission.structureId) {
                    // @ts-ignore
                    mission.structure = structuresById[mission.structureId!];
                }
                // @ts-ignore
                mission.candidatures = mission.candidatures.map((candidature) => ({
                    ...candidature,
                    young: youngsById[candidature.youngId!.toString()],
                }));
            }
            return mission;
        });
    }

    async retrieveYoungs(candidatures: ApplicationType[]) {
        // prepare youngs for search
        const youngsById: Record<string, Partial<YoungType>> = candidatures.reduce(
            (acc, candidature) => {
                if (candidature.youngId) {
                    acc[candidature.youngId] = { _id: candidature.youngId };
                }
                return acc;
            },
            {} as Record<string, Partial<YoungType>>,
        );
        const nbJeunes = Object.keys(youngsById).length;
        this.logger.log(`jeunes count: ${nbJeunes}`, ExporterMissionCanditatures.name);

        if (nbJeunes === 0) {
            return {};
        }

        // search youngs data
        const youngs = await this.searchYoungGateway.searchYoung({
            musts: { ids: Object.keys(youngsById) },
            full: true,
        });
        this.logger.log(`jeunes search count: ${youngs.hits.length}`, ExporterMissionCanditatures.name);

        if (youngs.hits.length === 0) {
            throw new FunctionalException(
                FunctionalExceptionCode.NOT_ENOUGH_DATA,
                `nbJeunes: ${nbJeunes} !== searchCount: ${youngs.hits.length}`,
            );
        }
        youngs.hits.forEach((young) => {
            youngsById[young._id] = young;
        });

        return youngsById;
    }

    mapCandidature(
        mission: MissionType,
        candidature: ApplicationType,
        selectedFields: string[],
        auteur: ExportMissionCandidaturesTaskParameters["auteur"],
    ) {
        const allFields = {
            identity: {
                ID: candidature?.young?._id?.toString(),
                Prénom: candidature?.young?.firstName,
                Nom: candidature?.young?.lastName,
                Sexe: translate(candidature?.young?.gender),
                Cohorte: candidature?.young?.cohort,
                "Date de naissance": formatDateFRTimezoneUTC(candidature?.young?.birthdateAt),
            },
            contact: {
                Email: candidature?.young?.email,
                Téléphone: candidature?.young?.phone,
            },
            imageRight: {
                "Droit à l'image": translate(candidature?.young?.imageRight),
            },
            address: {
                "Issu de QPV": translate(candidature?.young?.qpv),
                "Adresse postale du volontaire": candidature?.young?.address,
                "Code postal du volontaire": candidature?.young?.zip,
                "Ville du volontaire": candidature?.young?.city,
                "Pays du volontaire": candidature?.young?.country,
            },
            location: {
                "Département du volontaire": candidature?.young?.department,
                "Académie du volontaire": candidature?.young?.academy,
                "Région du volontaire": candidature?.young?.region,
            },
            candidature: {
                "Statut de la candidature": translateApplication(candidature?.status),
                "Choix - Ordre de la candidature": candidature?.priority,
                "Candidature créée le": formatLongDateUTC(candidature?.createdAt),
                "Candidature mise à jour le": formatLongDateUTC(candidature?.updatedAt),
                "Statut du contrat d'engagement": translate(candidature?.contractStatus),
                "Pièces jointes à l'engagement": translate(
                    `${optionsType.reduce((sum, option) => sum + candidature[option]?.length, 0) !== 0}`,
                ),
                "Statut du dossier d'éligibilité PM": translate(candidature?.young?.statusMilitaryPreparationFiles),
            },
            missionInfo: {
                "ID de la mission": mission._id.toString(),
                "Titre de la mission": mission.name,
                "Date du début": formatDateFRTimezoneUTC(mission.startAt),
                "Date de fin": formatDateFRTimezoneUTC(mission.endAt),
                "Domaine d'action principal": translate(mission.mainDomain),
                "Préparation militaire": translate(mission.isMilitaryPreparation),
            },
            missionTutor: {
                "Id du tuteur": mission.tutorId || "La mission n'a pas de tuteur",
                "Nom du tuteur": mission.tutor?.lastName,
                "Prénom du tuteur": mission.tutor?.firstName,
                "Email du tuteur": mission.tutor?.email,
                "Portable du tuteur": mission.tutor?.mobile,
                "Téléphone du tuteur": mission.tutor?.phone,
            },
            missionlocation: {
                "Adresse de la mission": mission.address,
                "Code postal de la mission": mission.zip,
                "Ville de la mission": mission.city,
                "Département de la mission": mission.department,
                "Région de la mission": mission.region,
            },
            structureInfo: {
                "Id de la structure": mission.structureId,
                "Nom de la structure": mission.structure?.name || "",
                "Statut juridique de la structure": mission.structure?.legalStatus || "",
                "Type de structure": mission.structure?.types?.toString() || "",
                "Sous-type de structure": mission.structure?.sousType || "",
                "Présentation de la structure": mission.structure?.description || "",
            },
            structureLocation: {
                "Adresse de la structure": mission.structure?.address || "",
                "Code postal de la structure": mission.structure?.zip || "",
                "Ville de la structure": mission.structure?.city || "",
                "Département de la structure": mission.structure?.department || "",
                "Région de la structure": mission.structure?.region || "",
            },
            status: {
                "Statut général": translate(candidature?.young?.status),
                "Statut Phase 2": translatePhase2(candidature?.young?.statusPhase2),
                "Dernier statut le": formatLongDateFR(candidature?.young?.lastStatusAt),
            },
            representative1: {
                "Statut représentant légal 1": translate(candidature?.young?.parent1Status),
                "Prénom représentant légal 1": candidature?.young?.parent1FirstName,
                "Nom représentant légal 1": candidature?.young?.parent1LastName,
                "Email représentant légal 1": candidature?.young?.parent1Email,
                "Téléphone représentant légal 1": candidature?.young?.parent1Phone,
                "Adresse représentant légal 1": candidature?.young?.parent1Address,
                "Code postal représentant légal 1": candidature?.young?.parent1Zip,
                "Ville représentant légal 1": candidature?.young?.parent1City,
                "Département représentant légal 1": candidature?.young?.parent1Department,
                "Région représentant légal 1": candidature?.young?.parent1Region,
            },
            representative2: {
                "Statut représentant légal 2": translate(candidature?.young?.parent2Status),
                "Prénom représentant légal 2": candidature?.young?.parent2FirstName,
                "Nom représentant légal 2": candidature?.young?.parent2LastName,
                "Email représentant légal 2": candidature?.young?.parent2Email,
                "Téléphone représentant légal 2": candidature?.young?.parent2Phone,
                "Adresse représentant légal 2": candidature?.young?.parent2Address,
                "Code postal représentant légal 2": candidature?.young?.parent2Zip,
                "Ville représentant légal 2": candidature?.young?.parent2City,
                "Département représentant légal 2": candidature?.young?.parent2Department,
                "Région représentant légal 2": candidature?.young?.parent2Region,
            },
        };
        if ([ROLES.RESPONSIBLE, ROLES.SUPERVISOR].includes(auteur.role!)) {
            delete allFields.address["Issu de QPV"];
        }
        const mappedCandidature: Record<string, any> = {};
        for (const element of selectedFields) {
            for (let subKey in allFields[element]) {
                mappedCandidature[subKey] = allFields[element][subKey];
            }
        }
        return mappedCandidature;
    }
}
