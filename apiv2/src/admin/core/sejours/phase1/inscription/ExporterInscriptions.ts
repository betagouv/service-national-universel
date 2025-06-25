import { UseCase } from "@shared/core/UseCase";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { FileGateway } from "@shared/core/File.gateway";
import {
    departmentLookUp,
    ExportInscriptionsTaskParameters,
    formatDateFRTimezoneUTC,
    formatLongDateFR,
    formatPhoneE164,
    isInRuralArea,
    MIME_TYPES,
    ROLES,
    SchoolType,
    translate,
    translatePhase1,
    translatePhase2,
    YOUNG_STATUS,
    YoungType,
} from "snu-lib";
import { ClockGateway } from "@shared/core/Clock.gateway";
import { CryptoGateway } from "@shared/core/Crypto.gateway";
import { NotificationGateway } from "@notification/core/Notification.gateway";
import { EmailTemplate, ExportMissionsParams } from "@notification/core/Notification";
import { FunctionalException, FunctionalExceptionCode } from "@shared/core/FunctionalException";
import { ReferentGateway } from "@admin/core/iam/Referent.gateway";
import { SearchYoungGateway } from "@analytics/core/SearchYoung.gateway";
import { StructureGateway } from "@admin/core/engagement/structure/Structure.gateway";
import { CandidatureGateway } from "@admin/core/engagement/candidature/Candidature.gateway";
import { SejourGateway } from "../sejour/Sejour.gateway";
import { SessionGateway } from "../session/Session.gateway";

export type ExporterInscriptionsResult = {
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
export class ExporterInscriptions implements UseCase<ExporterInscriptionsResult> {
    private readonly logger: Logger = new Logger(ExporterInscriptions.name);

    constructor(
        @Inject(ReferentGateway) private readonly referentGateway: ReferentGateway,
        @Inject(StructureGateway) private readonly structureGateway: StructureGateway,
        @Inject(SejourGateway) private readonly sejourGateway: SejourGateway,
        @Inject(SessionGateway) private readonly sessionGateway: SessionGateway,
        @Inject(CandidatureGateway) private readonly candidatureGateway: CandidatureGateway,
        @Inject(SearchYoungGateway) private readonly searchYoungGateway: SearchYoungGateway,
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
    }: ExportInscriptionsTaskParameters): Promise<ExporterInscriptionsResult> {
        this.logger.log(`ExporterInscriptions: ${JSON.stringify(fields, null, 2)}`);

        if (!auteur.id) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, "aureur.id is required");
        }
        const referent = await this.referentGateway.findById(auteur.id);
        if (!referent) {
            throw new FunctionalException(FunctionalExceptionCode.NOT_FOUND, `Referent not found: ${auteur.id}`);
        }

        const musts: Record<string, string | string[]> = {};

        if (auteur.role !== ROLES.ADMIN && !filters.status?.length) {
            filters.status = [
                YOUNG_STATUS.WAITING_VALIDATION,
                YOUNG_STATUS.WAITING_CORRECTION,
                YOUNG_STATUS.REFUSED,
                YOUNG_STATUS.VALIDATED,
                YOUNG_STATUS.WITHDRAWN,
                YOUNG_STATUS.WAITING_LIST,
                YOUNG_STATUS.ABANDONED,
                YOUNG_STATUS.REINSCRIPTION,
            ];
        }

        if (auteur.role === ROLES.REFERENT_DEPARTMENT || auteur.role === ROLES.REFERENT_REGION) {
            filters.status = YOUNG_STATUS.IN_PROGRESS;
        }

        if ([ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE].includes(auteur.role!)) {
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

        if (auteur.role === ROLES.RESPONSIBLE) {
            if (!referent.structureId) {
                throw new FunctionalException(
                    FunctionalExceptionCode.NOT_ENOUGH_DATA,
                    "Referent structureId is required",
                );
            }
            const candidatures = await this.candidatureGateway.findByStructureId(referent.structureId);
            musts._id = candidatures.map((candidature) => candidature.jeuneId!);
        }

        if (auteur.role === ROLES.SUPERVISOR) {
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

        if (auteur.role === ROLES.REFERENT_REGION) {
            filters.region = referent.region;
        }
        if (auteur.role === ROLES.REFERENT_DEPARTMENT) {
            filters.department = referent.departement!;
        }

        if (auteur.role === ROLES.VISITOR) {
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

        this.logger.log(`inscriptions count: ${inscriptions.hits.length}`);

        const excelData = await this.generateRapport(inscriptions.hits, fields, auteur);

        this.logger.log(`Generate excel`);
        // création du fichier excel de rapport
        const fileBuffer = await this.fileGateway.generateExcelFromValues({
            ...excelData,
            sheetName: "data",
        });

        this.logger.log(`Upload excel`);
        // upload du rapport du s3
        const timestamp = this.clockGateway.formatSafeDateTime(new Date());
        const fileName = `inscriptions_${this.cryptoGateway.getUuid()}_${timestamp}.xlsx`;
        const rapportFile = await this.fileGateway.uploadFile(
            `file/admin/sejours/phase1/inscription/${fileName}`,
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
                url: `https://${rapportFile.Location}`,
            },
            EmailTemplate.EXPORT_MISSION_CANDIDATURES,
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
        inscriptions: YoungType[],
        selectedFields: string[],
        auteur: ExportInscriptionsTaskParameters["auteur"],
    ) {
        let updatedInscriptions = inscriptions;
        let schoolsById: Record<string, Partial<SchoolType>> = {};

        // Récupérer les établissements
        // schoolsById = await this.exportMissionService.retrieveSchools(inscriptions);

        const result: any[] = [];
        updatedInscriptions.forEach((inscription, index) => {
            if (index % 1000 === 0) {
                this.logger.log(`mapping ${index}/${updatedInscriptions.length}`);
            }
            const mappedInscription = this.mapInscription(inscription, selectedFields, auteur);
            result.push(mappedInscription);
        });

        this.logger.log(`result ${result.length}`);

        return {
            columnsName: Object.keys(result[0]),
            values: result.map((item) => Object.values(item)),
        };
    }

    mapInscription(
        inscription: YoungType,
        selectedFields: string[],
        auteur: ExportInscriptionsTaskParameters["auteur"],
    ) {
        return {
            _id: inscription._id,
            Cohorte: inscription.cohort,
            Prénom: inscription.firstName,

            Nom: inscription.lastName,
            "Date de naissance": formatDateFRTimezoneUTC(inscription.birthdateAt),
            "Pays de naissance": inscription.birthCountry || "France",
            "Ville de naissance": inscription.birthCity,
            "Code postal de naissance": inscription.birthCityZip,
            "Date de fin de validité de la pièce d'identité": formatDateFRTimezoneUTC(
                inscription?.latestCNIFileExpirationDate,
            ),
            Sexe: translate(inscription.gender),
            Email: inscription.email,
            Téléphone: formatPhoneE164(inscription.phone, inscription.phoneZone),
            "Adresse postale": inscription.address,
            "Code postal": inscription.zip,
            Ville: inscription.city,
            Département: inscription.department,
            Région: inscription.region,
            Académie: inscription.academy,
            Pays: inscription.country,
            "Nom de l'hébergeur": inscription.hostLastName,
            "Prénom de l'hébergeur": inscription.hostFirstName,
            "Lien avec l'hébergeur": inscription.hostRelationship,
            "Adresse - étranger": inscription.foreignAddress,
            "Code postal - étranger": inscription.foreignZip,
            "Ville - étranger": inscription.foreignCity,
            "Pays - étranger": inscription.foreignCountry,
            Situation: translate(inscription.situation),
            Niveau: inscription.grade,
            // @ts-ignore
            "Type d'établissement": translate(inscription.school?.type || inscription.schoolType),
            // @ts-ignore
            "Nom de l'établissement": inscription.school?.fullName || inscription.schoolName,
            // @ts-ignore
            "Code postal de l'établissement": inscription.school?.postcode || inscription.schoolZip,
            // @ts-ignore
            "Ville de l'établissement": inscription.school?.city || inscription.schoolCity,
            "Département de l'établissement":
                // @ts-ignore
                departmentLookUp[inscription.school?.department] || inscription.schoolDepartment,
            // @ts-ignore
            "UAI de l'établissement": inscription.school?.uai,
            "Quartier Prioritaire de la ville": translate(inscription.qpv),
            "Zone Rurale": translate(isInRuralArea(inscription)),
            Handicap: translate(inscription.handicap),
            "Bénéficiaire d'un PPS": translate(inscription.ppsBeneficiary),
            "Bénéficiaire d'un PAI": translate(inscription.paiBeneficiary),
            "Structure médico-sociale": translate(inscription.medicosocialStructure),
            "Nom de la structure médico-sociale": inscription.medicosocialStructureName,
            "Adresse de la structure médico-sociale": inscription.medicosocialStructureAddress,
            "Code postal de la structure médico-sociale": inscription.medicosocialStructureZip,
            "Ville de la structure médico-sociale": inscription.medicosocialStructureCity,
            "Aménagement spécifique": translate(inscription.specificAmenagment),
            "Nature de l'aménagement spécifique": inscription.specificAmenagmentType,
            "Aménagement pour mobilité réduite": translate(inscription.reducedMobilityAccess),
            "Besoin d'être affecté(e) dans le département de résidence": translate(
                inscription.handicapInSameDepartment,
            ),
            "Allergies ou intolérances alimentaires": translate(inscription.allergies),
            "Activité de haut-niveau": translate(inscription.highSkilledActivity),
            "Nature de l'activité de haut-niveau": inscription.highSkilledActivityType,
            "Activités de haut niveau nécessitant d'être affecté dans le département de résidence": translate(
                inscription.highSkilledActivityInSameDepartment,
            ),
            "Document activité de haut-niveau ": inscription.highSkilledActivityProofFiles,
            "Consentement des représentants légaux": translate(inscription.parentConsentment),
            "Droit à l'image": translate(inscription.imageRight),
            "Autotest PCR": translate(inscription.autoTestPCR),
            "Règlement intérieur": translate(inscription.rulesYoung),
            "Fiche sanitaire réceptionnée": translate(inscription.cohesionStayMedicalFileReceived) || "Non Renseigné",
            PSC1: translate(inscription.psc1Info) || "Non Renseigné",
            "Remboursement Code de la Route": translate(inscription.roadCodeRefund) || "Non renseigné",
            "Statut représentant légal 1": translate(inscription.parent1Status),
            "Prénom représentant légal 1": inscription.parent1FirstName,
            "Nom représentant légal 1": inscription.parent1LastName,
            "Email représentant légal 1": inscription.parent1Email,
            "Téléphone représentant légal 1": formatPhoneE164(inscription.parent1Phone, inscription.parent1PhoneZone),
            "Adresse représentant légal 1": inscription.parent1Address,
            "Code postal représentant légal 1": inscription.parent1Zip,
            "Ville représentant légal 1": inscription.parent1City,
            "Département représentant légal 1": inscription.parent1Department,
            "Région représentant légal 1": inscription.parent1Region,
            "Statut représentant légal 2": translate(inscription.parent2Status),
            "Prénom représentant légal 2": inscription.parent2FirstName,
            "Nom représentant légal 2": inscription.parent2LastName,
            "Email représentant légal 2": inscription.parent2Email,
            "Téléphone représentant légal 2": formatPhoneE164(inscription.parent2Phone, inscription.parent2PhoneZone),
            "Adresse représentant légal 2": inscription.parent2Address,
            "Code postal représentant légal 2": inscription.parent2Zip,
            "Ville représentant légal 2": inscription.parent2City,
            "Département représentant légal 2": inscription.parent2Department,
            "Région représentant légal 2": inscription.parent2Region,
            Motivation: inscription.motivations,
            Phase: translate(inscription.phase),
            "Créé lé": formatLongDateFR(inscription.createdAt),
            "Mis à jour le": formatLongDateFR(inscription.updatedAt),
            "Dernière connexion le": formatLongDateFR(inscription.lastLoginAt),
            "Statut général": translate(inscription.status),
            "Statut Phase 1": translatePhase1(inscription.statusPhase1),
            "Statut Phase 2": translatePhase2(inscription.statusPhase2),
            "Dernier statut le": formatLongDateFR(inscription.lastStatusAt),
            "Email de connexion": inscription.email,
        };
    }
}
