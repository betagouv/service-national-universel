import { CohortType } from "snu-lib";

import { SessionDocument } from "../provider/SessionMongo.provider";
import { CreateSessionModel, SessionModel } from "@admin/core/sejours/phase1/session/Session.model";

type SessionType = Omit<
    CohortType,
    | "createdAt"
    | "updatedAt"
    | "isInscriptionOpen"
    | "isReInscriptionOpen"
    | "isInstructionOpen"
    | "getIsInscriptionOpen"
    | "getIsInstructionOpen"
    | "getIsReInscriptionOpen"
>;

export class SessionMapper {
    static toModels(sejourDocuments: SessionDocument[]): SessionModel[] {
        return sejourDocuments.map((sejourDocument) => this.toModel(sejourDocument));
    }

    static toModel(sejourDocument: SessionDocument): SessionModel {
        return {
            id: sejourDocument._id.toString(),
            nom: sejourDocument.name,
            snuId: sejourDocument.snuId,
            statut: sejourDocument.status,
            type: sejourDocument.type,
            cohortGroupId: sejourDocument.cohortGroupId,
            dsnjExportDates: {
                cohesionCenters: sejourDocument.dsnjExportDates?.cohesionCenters,
                youngsBeforeSession: sejourDocument.dsnjExportDates?.youngsBeforeSession,
                youngsAfterSession: sejourDocument.dsnjExportDates?.youngsAfterSession,
            },
            injepExportDates: {
                youngsBeforeSession: sejourDocument.injepExportDates?.youngsBeforeSession,
                youngsAfterSession: sejourDocument.injepExportDates?.youngsAfterSession,
            },
            isAssignmentAnnouncementsOpenForYoung: !!sejourDocument.isAssignmentAnnouncementsOpenForYoung,
            manualAffectionOpenForAdmin: sejourDocument.manualAffectionOpenForAdmin,
            manualAffectionOpenForReferentRegion: sejourDocument.manualAffectionOpenForReferentRegion,
            manualAffectionOpenForReferentDepartment: sejourDocument.manualAffectionOpenForReferentDepartment,
            dateStart: sejourDocument.dateStart,
            dateEnd: sejourDocument.dateEnd,
            eligibility: {
                zones: sejourDocument.eligibility.zones,
                schoolLevels: sejourDocument.eligibility.schoolLevels,
                bornAfter: sejourDocument.eligibility.bornAfter,
                bornBefore: sejourDocument.eligibility.bornBefore,
            },
            inscriptionStartDate: sejourDocument.inscriptionStartDate,
            inscriptionEndDate: sejourDocument.inscriptionEndDate,
            instructionEndDate: sejourDocument.instructionEndDate,
            inscriptionModificationEndDate: sejourDocument.inscriptionModificationEndDate,
            reInscriptionStartDate: sejourDocument.reInscriptionStartDate,
            reInscriptionEndDate: sejourDocument.reInscriptionEndDate,
            buffer: sejourDocument.buffer,
            event: sejourDocument.event,
            pdrChoiceLimitDate: sejourDocument.pdrChoiceLimitDate,
            cleUpdateCohortForReferentRegion: sejourDocument.cleUpdateCohortForReferentRegion,
            cleUpdateCohortForReferentRegionDate: {
                from: sejourDocument.cleUpdateCohortForReferentRegionDate?.from,
                to: sejourDocument.cleUpdateCohortForReferentRegionDate?.to,
            },
            cleUpdateCohortForReferentDepartment: sejourDocument.cleUpdateCohortForReferentDepartment,
            cleUpdateCohortForReferentDepartmentDate: {
                from: sejourDocument.cleUpdateCohortForReferentDepartmentDate?.from,
                to: sejourDocument.cleUpdateCohortForReferentDepartmentDate?.to,
            },
            cleDisplayCohortsForAdminCLE: sejourDocument.cleDisplayCohortsForAdminCLE,
            cleDisplayCohortsForAdminCLEDate: {
                from: sejourDocument.cleDisplayCohortsForAdminCLEDate?.from,
                to: sejourDocument.cleDisplayCohortsForAdminCLEDate?.to,
            },
            cleDisplayCohortsForReferentClasse: sejourDocument.cleDisplayCohortsForReferentClasse,
            cleDisplayCohortsForReferentClasseDate: {
                from: sejourDocument.cleDisplayCohortsForReferentClasseDate?.from,
                to: sejourDocument.cleDisplayCohortsForReferentClasseDate?.to,
            },
            cleUpdateCentersForReferentRegion: sejourDocument.cleUpdateCentersForReferentRegion,
            cleUpdateCentersForReferentRegionDate: {
                from: sejourDocument.cleUpdateCentersForReferentRegionDate?.from,
                to: sejourDocument.cleUpdateCentersForReferentRegionDate?.to,
            },
            cleUpdateCentersForReferentDepartment: sejourDocument.cleUpdateCentersForReferentDepartment,
            cleUpdateCentersForReferentDepartmentDate: {
                from: sejourDocument.cleUpdateCentersForReferentDepartmentDate?.from,
                to: sejourDocument.cleUpdateCentersForReferentDepartmentDate?.to,
            },
            cleDisplayCentersForAdminCLE: sejourDocument.cleDisplayCentersForAdminCLE,
            cleDisplayCentersForAdminCLEDate: {
                from: sejourDocument.cleDisplayCentersForAdminCLEDate?.from,
                to: sejourDocument.cleDisplayCentersForAdminCLEDate?.to,
            },
            cleDisplayCentersForReferentClasse: sejourDocument.cleDisplayCentersForReferentClasse,
            cleDisplayCentersForReferentClasseDate: {
                from: sejourDocument.cleDisplayCentersForReferentClasseDate?.from,
                to: sejourDocument.cleDisplayCentersForReferentClasseDate?.to,
            },
            cleDisplayPDRForAdminCLE: sejourDocument.cleDisplayPDRForAdminCLE,
            cleDisplayPDRForAdminCLEDate: {
                from: sejourDocument.cleDisplayPDRForAdminCLEDate?.from,
                to: sejourDocument.cleDisplayPDRForAdminCLEDate?.to,
            },
            cleDisplayPDRForReferentClasse: sejourDocument.cleDisplayPDRForReferentClasse,
            cleDisplayPDRForReferentClasseDate: {
                from: sejourDocument.cleDisplayPDRForReferentClasseDate?.from,
                to: sejourDocument.cleDisplayPDRForReferentClasseDate?.to,
            },
            validationDate: sejourDocument.validationDate,
            validationDateForTerminaleGrade: sejourDocument.validationDateForTerminaleGrade,
            youngCheckinForAdmin: sejourDocument.youngCheckinForAdmin,
            youngCheckinForHeadOfCenter: sejourDocument.youngCheckinForHeadOfCenter,
            youngCheckinForRegionReferent: sejourDocument.youngCheckinForRegionReferent,
            youngCheckinForDepartmentReferent: sejourDocument.youngCheckinForDepartmentReferent,
            busListAvailability: sejourDocument.busListAvailability,
            sessionEditionOpenForReferentRegion: sejourDocument.sessionEditionOpenForReferentRegion,
            sessionEditionOpenForReferentDepartment: sejourDocument.sessionEditionOpenForReferentDepartment,
            sessionEditionOpenForTransporter: sejourDocument.sessionEditionOpenForTransporter,
            pdrEditionOpenForReferentRegion: sejourDocument.pdrEditionOpenForReferentRegion,
            pdrEditionOpenForReferentDepartment: sejourDocument.pdrEditionOpenForReferentDepartment,
            pdrEditionOpenForTransporter: sejourDocument.pdrEditionOpenForTransporter,
            informationsConvoyage: sejourDocument.informationsConvoyage
                ? {
                      editionOpenForReferentRegion: sejourDocument.informationsConvoyage.editionOpenForReferentRegion,
                      editionOpenForReferentDepartment:
                          sejourDocument.informationsConvoyage.editionOpenForReferentDepartment,
                      editionOpenForHeadOfCenter: sejourDocument.informationsConvoyage.editionOpenForHeadOfCenter,
                  }
                : undefined,
            repartitionSchemaCreateAndEditGroupAvailability:
                sejourDocument.repartitionSchemaCreateAndEditGroupAvailability,
            repartitionSchemaDownloadAvailability: sejourDocument.repartitionSchemaDownloadAvailability,
            isTransportPlanCorrectionRequestOpen: sejourDocument.isTransportPlanCorrectionRequestOpen,
            schemaAccessForReferentRegion: sejourDocument.schemaAccessForReferentRegion,
            schemaAccessForReferentDepartment: sejourDocument.schemaAccessForReferentDepartment,
            busEditionOpenForTransporter: sejourDocument.busEditionOpenForTransporter,
            daysToValidate: sejourDocument.daysToValidate,
            daysToValidateForTerminalGrade: sejourDocument.daysToValidateForTerminalGrade,
            inscriptionOpenForReferentClasse: sejourDocument.inscriptionOpenForReferentClasse,
            inscriptionOpenForReferentRegion: sejourDocument.inscriptionOpenForReferentRegion,
            inscriptionOpenForReferentDepartment: sejourDocument.inscriptionOpenForReferentDepartment,
            inscriptionOpenForAdministrateurCle: sejourDocument.inscriptionOpenForAdministrateurCle,
            createdAt: sejourDocument.createdAt,
            updatedAt: sejourDocument.updatedAt,
        };
    }

    static toEntity(sejourModel: SessionModel): SessionType {
        return {
            _id: sejourModel.id,
            ...this.toEntityCreate(sejourModel),
            isAssignmentAnnouncementsOpenForYoung: sejourModel.isAssignmentAnnouncementsOpenForYoung,
            cleUpdateCohortForReferentRegion: sejourModel.cleUpdateCohortForReferentRegion,
            cleUpdateCohortForReferentRegionDate: {
                from: sejourModel.cleUpdateCohortForReferentRegionDate?.from,
                to: sejourModel.cleUpdateCohortForReferentRegionDate?.to,
            },
            cleUpdateCohortForReferentDepartment: sejourModel.cleUpdateCohortForReferentDepartment,
            cleUpdateCohortForReferentDepartmentDate: {
                from: sejourModel.cleUpdateCohortForReferentDepartmentDate.from,
                to: sejourModel.cleUpdateCohortForReferentDepartmentDate.to,
            },
            cleDisplayCohortsForAdminCLE: sejourModel.cleDisplayCohortsForAdminCLE,
            cleDisplayCohortsForAdminCLEDate: {
                from: sejourModel.cleDisplayCohortsForAdminCLEDate.from,
                to: sejourModel.cleDisplayCohortsForAdminCLEDate.to,
            },
            cleDisplayCohortsForReferentClasse: sejourModel.cleDisplayCohortsForReferentClasse,
            cleDisplayCohortsForReferentClasseDate: {
                from: sejourModel.cleDisplayCohortsForReferentClasseDate.from,
                to: sejourModel.cleDisplayCohortsForReferentClasseDate.to,
            },
            cleUpdateCentersForReferentRegion: sejourModel.cleUpdateCentersForReferentRegion,
            cleUpdateCentersForReferentRegionDate: {
                from: sejourModel.cleUpdateCentersForReferentRegionDate.from,
                to: sejourModel.cleUpdateCentersForReferentRegionDate.to,
            },
            cleUpdateCentersForReferentDepartment: sejourModel.cleUpdateCentersForReferentDepartment,
            cleUpdateCentersForReferentDepartmentDate: {
                from: sejourModel.cleUpdateCentersForReferentDepartmentDate.from,
                to: sejourModel.cleUpdateCentersForReferentDepartmentDate.to,
            },
            cleDisplayCentersForAdminCLE: sejourModel.cleDisplayCentersForAdminCLE,
            cleDisplayCentersForAdminCLEDate: {
                from: sejourModel.cleDisplayCentersForAdminCLEDate.from,
                to: sejourModel.cleDisplayCentersForAdminCLEDate.to,
            },
            cleDisplayCentersForReferentClasse: sejourModel.cleDisplayCentersForReferentClasse,
            cleDisplayCentersForReferentClasseDate: {
                from: sejourModel.cleDisplayCentersForReferentClasseDate.from,
                to: sejourModel.cleDisplayCentersForReferentClasseDate.to,
            },
            cleDisplayPDRForAdminCLE: sejourModel.cleDisplayPDRForAdminCLE,
            cleDisplayPDRForAdminCLEDate: {
                from: sejourModel.cleDisplayPDRForAdminCLEDate.from,
                to: sejourModel.cleDisplayPDRForAdminCLEDate.to,
            },
            cleDisplayPDRForReferentClasse: sejourModel.cleDisplayPDRForReferentClasse,
            cleDisplayPDRForReferentClasseDate: {
                from: sejourModel.cleDisplayPDRForReferentClasseDate.from,
                to: sejourModel.cleDisplayPDRForReferentClasseDate.to,
            },
            youngCheckinForRegionReferent: sejourModel.youngCheckinForRegionReferent,
            busListAvailability: sejourModel.busListAvailability,
            pdrEditionOpenForReferentRegion: sejourModel.pdrEditionOpenForReferentRegion,
            pdrEditionOpenForReferentDepartment: sejourModel.pdrEditionOpenForReferentDepartment,
            pdrEditionOpenForTransporter: sejourModel.pdrEditionOpenForTransporter,
            schemaAccessForReferentRegion: sejourModel.schemaAccessForReferentRegion,
            schemaAccessForReferentDepartment: sejourModel.schemaAccessForReferentDepartment,
            busEditionOpenForTransporter: sejourModel.busEditionOpenForTransporter,
            daysToValidate: sejourModel.daysToValidate,
            daysToValidateForTerminalGrade: sejourModel.daysToValidateForTerminalGrade,
            inscriptionOpenForReferentClasse: sejourModel.inscriptionOpenForReferentClasse,
            inscriptionOpenForReferentRegion: sejourModel.inscriptionOpenForReferentRegion,
            inscriptionOpenForReferentDepartment: sejourModel.inscriptionOpenForReferentDepartment,
            inscriptionOpenForAdministrateurCle: sejourModel.inscriptionOpenForAdministrateurCle,
        };
    }

    static toEntityCreate(
        sejourModel: CreateSessionModel,
    ): Omit<
        SessionType,
        | "_id"
        | "createdAt"
        | "updatedAt"
        | "cleUpdateCohortForReferentRegion"
        | "cleUpdateCohortForReferentDepartment"
        | "cleDisplayCohortsForAdminCLE"
        | "cleDisplayCohortsForReferentClasse"
        | "cleUpdateCentersForReferentRegion"
        | "cleUpdateCentersForReferentDepartment"
        | "cleDisplayCentersForAdminCLE"
        | "cleDisplayCentersForReferentClasse"
        | "cleDisplayPDRForAdminCLE"
        | "cleDisplayPDRForReferentClasse"
        | "isAssignmentAnnouncementsOpenForYoung"
        | "cleUpdateCohortForReferentRegionDate"
        | "cleUpdateCohortForReferentDepartmentDate"
        | "cleDisplayCohortsForAdminCLEDate"
        | "cleDisplayCohortsForReferentClasseDate"
        | "cleUpdateCentersForReferentRegionDate"
        | "cleUpdateCentersForReferentDepartmentDate"
        | "cleDisplayCentersForAdminCLEDate"
        | "cleDisplayCentersForReferentClasseDate"
        | "cleDisplayPDRForAdminCLEDate"
        | "cleDisplayPDRForReferentClasseDate"
        | "pdrEditionOpenForReferentRegion"
        | "pdrEditionOpenForReferentDepartment"
        | "pdrEditionOpenForTransporter"
        | "schemaAccessForReferentRegion"
        | "schemaAccessForReferentDepartment"
        | "busListAvailability"
        | "busEditionOpenForTransporter"
        | "daysToValidate"
        | "youngCheckinForRegionReferent"
        | "inscriptionOpenForReferentRegion"
        | "inscriptionOpenForReferentClasse"
        | "inscriptionOpenForReferentRegion"
        | "inscriptionOpenForReferentDepartment"
        | "inscriptionOpenForAdministrateurCle"
    > {
        return {
            name: sejourModel.nom,
            snuId: sejourModel.snuId,
            status: sejourModel.statut as any,
            type: sejourModel.type as any,
            cohortGroupId: sejourModel.cohortGroupId,
            dsnjExportDates: {
                cohesionCenters: sejourModel.dsnjExportDates?.cohesionCenters,
                youngsBeforeSession: sejourModel.dsnjExportDates?.youngsBeforeSession,
                youngsAfterSession: sejourModel.dsnjExportDates?.youngsAfterSession,
            },
            injepExportDates: {
                youngsBeforeSession: sejourModel.injepExportDates?.youngsBeforeSession,
                youngsAfterSession: sejourModel.injepExportDates?.youngsAfterSession,
            },

            manualAffectionOpenForAdmin: sejourModel.manualAffectionOpenForAdmin,
            manualAffectionOpenForReferentRegion: sejourModel.manualAffectionOpenForReferentRegion,
            manualAffectionOpenForReferentDepartment: sejourModel.manualAffectionOpenForReferentDepartment,
            dateStart: sejourModel.dateStart,
            dateEnd: sejourModel.dateEnd,
            eligibility: {
                zones: sejourModel.eligibility.zones,
                schoolLevels: sejourModel.eligibility.schoolLevels,
                bornAfter: sejourModel.eligibility.bornAfter,
                bornBefore: sejourModel.eligibility.bornBefore,
            },
            inscriptionStartDate: sejourModel.inscriptionStartDate,
            inscriptionEndDate: sejourModel.inscriptionEndDate,
            instructionEndDate: sejourModel.instructionEndDate,
            inscriptionModificationEndDate: sejourModel.inscriptionModificationEndDate,
            reInscriptionStartDate: sejourModel.reInscriptionStartDate,
            reInscriptionEndDate: sejourModel.reInscriptionEndDate,
            buffer: sejourModel.buffer,
            event: sejourModel.event,
            pdrChoiceLimitDate: sejourModel.pdrChoiceLimitDate,

            validationDate: sejourModel.validationDate,
            validationDateForTerminaleGrade: sejourModel.validationDateForTerminaleGrade,
            youngCheckinForAdmin: sejourModel.youngCheckinForAdmin,
            youngCheckinForHeadOfCenter: sejourModel.youngCheckinForHeadOfCenter,
            youngCheckinForDepartmentReferent: sejourModel.youngCheckinForDepartmentReferent,
            sessionEditionOpenForReferentRegion: sejourModel.sessionEditionOpenForReferentRegion,
            sessionEditionOpenForReferentDepartment: sejourModel.sessionEditionOpenForReferentDepartment,
            sessionEditionOpenForTransporter: sejourModel.sessionEditionOpenForTransporter,

            informationsConvoyage: sejourModel.informationsConvoyage
                ? {
                      editionOpenForReferentRegion: sejourModel.informationsConvoyage.editionOpenForReferentRegion,
                      editionOpenForReferentDepartment:
                          sejourModel.informationsConvoyage.editionOpenForReferentDepartment,
                      editionOpenForHeadOfCenter: sejourModel.informationsConvoyage.editionOpenForHeadOfCenter,
                  }
                : undefined,
            repartitionSchemaCreateAndEditGroupAvailability:
                sejourModel.repartitionSchemaCreateAndEditGroupAvailability,
            repartitionSchemaDownloadAvailability: sejourModel.repartitionSchemaDownloadAvailability,
            isTransportPlanCorrectionRequestOpen: sejourModel.isTransportPlanCorrectionRequestOpen,
        };
    }
}
