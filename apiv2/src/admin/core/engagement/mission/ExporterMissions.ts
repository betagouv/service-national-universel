import { UseCase } from "@shared/core/UseCase";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import {
    ExportMissionsTaskParameters,
    formatDateFRTimezoneUTC,
    formatLongDateFR,
    MIME_TYPES,
    MissionType,
    ReferentType,
    StructureType,
    translate,
    translateVisibilty,
} from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTemplate, ExportMissionsParams } from "@notification/core/Notification";
import { ExportMissionService } from "./ExportMission.service";

export type ExporterMissionsResult = {
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

@Injectable()
export class ExporterMissions implements UseCase<ExporterMissionsResult> {
    private readonly logger: Logger = new Logger(ExporterMissions.name);

    constructor(
        private readonly exportMissionService: ExportMissionService,
        @Inject(FileGateway) private readonly fileGateway: FileGateway,
        @Inject(ClockGateway) private readonly clockGateway: ClockGateway,
        @Inject(CryptoGateway) private readonly cryptoGateway: CryptoGateway,
        @Inject(NotificationGateway) private readonly notificationGateway: NotificationGateway,
    ) {}

    async execute({
        filters,
        fields,
        searchTerm,
        auteur,
    }: ExportMissionsTaskParameters): Promise<ExporterMissionsResult> {
        this.logger.log(`ExporterMissions: ${JSON.stringify(fields, null, 2)}`);

        const { missions, referent } = await this.exportMissionService.searchMissions({
            fields,
            filters,
            searchTerm,
            auteur,
        });

        this.logger.log(`missions count: ${missions.hits.length}`);

        const excelData = await this.generateRapport(missions.hits, fields, auteur);

        this.logger.log(`Generate excel`);
        // création du fichier excel de rapport
        const fileBuffer = await this.fileGateway.generateExcelFromValues({
            ...excelData,
            sheetName: "data",
        });

        this.logger.log(`Upload excel`);
        // upload du rapport du s3
        const timestamp = this.clockGateway.formatSafeDateTime(new Date());
        const fileName = `missions_${this.cryptoGateway.getUuid()}_${timestamp}.xlsx`;
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
        auteur: ExportMissionsTaskParameters["auteur"],
    ) {
        if (missions.length === 0) {
            return {
                columnsName: [],
                values: [],
            };
        }
        let updatedMissions = missions;
        let tutorsById: Record<string, Partial<ReferentType>> = {};
        let structuresById: Record<string, Partial<StructureType>> = {};

        // Récupérer les tuteurs si nécessaire
        if (selectedFields.includes("tutor")) {
            tutorsById = await this.exportMissionService.retrieveTutors(missions);
        }
        // Récupérer les structures si nécessaire
        if (selectedFields.includes("structureInfo") || selectedFields.includes("structureLocation")) {
            structuresById = await this.exportMissionService.retrieveStructures(missions);
        }

        const result: any[] = [];
        updatedMissions.forEach((mission, index) => {
            if (index % 1000 === 0) {
                this.logger.log(`mapping ${index}/${updatedMissions.length}`);
            }
            if (mission.tutorId) {
                // @ts-ignore
                mission.tutor = tutorsById[mission.tutorId!];
            }
            if (mission.structureId) {
                // @ts-ignore
                mission.structure = structuresById[mission.structureId!];
            }
            if (!mission.domains) mission.domains = [];
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
            const mappedMission = this.mapMission(mission, selectedFields, auteur);
            result.push(mappedMission);
        });

        this.logger.log(`result ${result.length}`);

        return {
            columnsName: Object.keys(result[0]),
            values: result.map((item) => Object.values(item)),
        };
    }

    mapMission(mission: MissionType, selectedFields: string[], auteur: ExportMissionsTaskParameters["auteur"]) {
        const allFields = {
            missionInfo: {
                "Titre de la mission": mission.name,
                "Date du début": formatDateFRTimezoneUTC(mission.startAt),
                "Date de fin": formatDateFRTimezoneUTC(mission.endAt),
                "Nombre de volontaires recherchés": mission.placesTotal,
                "Places restantes sur la mission": mission.placesLeft,
                "Visibilité de la mission": translateVisibilty(mission.visibility),
                "Source de la mission": mission.isJvaMission === "true" ? "JVA" : "SNU",
            },
            status: {
                "Statut de la mission": translate(mission.status),
                "Créée le": formatLongDateFR(mission.createdAt),
                "Mise à jour le": formatLongDateFR(mission.updatedAt),
                "Commentaire sur le statut": mission.statusComment,
            },
            missionType: {
                "Domaine principal de la mission": translate(mission.mainDomain) || "Non renseigné",
                "Domaine(s) secondaire(s) de la mission": mission.mainDomain
                    ? mission.domains.filter((d) => d !== mission.mainDomain)?.map(translate)
                    : mission.domains?.map(translate),
                Format: translate(mission.format),
                "Préparation militaire": translate(mission.isMilitaryPreparation),
            },
            missionDetails: {
                "Objectifs de la mission": mission.description,
                "Actions concrètes": mission.actions,
                Contraintes: mission.contraintes,
                Durée: mission.duration,
                "Fréquence estimée": mission.frequence,
                "Période de réalisation": mission.period?.map(translate)?.join(", "),
                "Hébergement proposé": translate(mission.hebergement),
                "Hébergement payant": translate(mission.hebergementPayant),
            },
            tutor: {
                "Id du tuteur": mission.tutorId || "La mission n'a pas de tuteur",
                "Nom du tuteur": mission.tutor?.lastName,
                "Prénom du tuteur": mission.tutor?.firstName,
                "Email du tuteur": mission.tutor?.email,
                "Portable du tuteur": mission.tutor?.mobile,
                "Téléphone du tuteur": mission.tutor?.phone,
            },
            location: {
                Adresse: mission.address,
                "Code postal": mission.zip,
                Ville: mission.city,
                Département: mission.department,
                Région: mission.region,
            },
            structureInfo: {
                "Id de la structure": mission.structureId,
                "Nom de la structure": mission.structure?.name || "",
                "Statut juridique de la structure": mission.structure?.legalStatus || "",
                "Type(s) de structure": mission.structure?.types?.toString() || "",
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
        };

        const fields: Record<string, any> = { _id: mission._id };
        for (const element of selectedFields) {
            let key;
            for (key in allFields[element]) fields[key] = allFields[element][key];
        }
        return fields;
    }
}
