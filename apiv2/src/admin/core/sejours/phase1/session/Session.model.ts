// TODO: Mettre à niveau pour de l'ecriture
export type SessionModel = {
    id: string;
    nom: string;
    snuId: string;
    statut: string;
    // legacy
    cohortGroupId?: string;
    dsnjExportDates?: {
        cohesionCenters?: Date;
        youngsBeforeSession?: Date;
        youngsAfterSession?: Date;
    };
    injepExportDates?: {
        youngsBeforeSession?: Date;
        youngsAfterSession?: Date;
    };
    isAssignmentAnnouncementsOpenForYoung: boolean;
    manualAffectionOpenForAdmin?: boolean;
    manualAffectionOpenForReferentRegion?: boolean;
    manualAffectionOpenForReferentDepartment?: boolean;
    dateStart: Date;
    dateEnd: Date;
    eligibility: {
        zones: string[];
        schoolLevels: string[];
        bornAfter: Date;
        bornBefore: Date;
    };
    inscriptionStartDate: Date;
    inscriptionEndDate: Date;
    instructionEndDate: Date;
    objectifLevel: string;
    inscriptionModificationEndDate?: Date;
    reInscriptionStartDate?: Date;
    reInscriptionEndDate?: Date;
    buffer: number;
    event: string;
    pdrChoiceLimitDate?: Date;
    cleUpdateCohortForReferentRegion: boolean;
    cleUpdateCohortForReferentRegionDate: { from?: Date; to?: Date };
    cleUpdateCohortForReferentDepartment: boolean;
    cleUpdateCohortForReferentDepartmentDate: { from?: Date; to?: Date };
    cleDisplayCohortsForAdminCLE: boolean;
    cleDisplayCohortsForAdminCLEDate: { from?: Date; to?: Date };
    cleDisplayCohortsForReferentClasse: boolean;
    cleDisplayCohortsForReferentClasseDate: { from?: Date; to?: Date };
    cleUpdateCentersForReferentRegion: boolean;
    cleUpdateCentersForReferentRegionDate: { from?: Date; to?: Date };
    cleUpdateCentersForReferentDepartment: boolean;
    cleUpdateCentersForReferentDepartmentDate: { from?: Date; to?: Date };
    cleDisplayCentersForAdminCLE: boolean;
    cleDisplayCentersForAdminCLEDate: { from?: Date; to?: Date };
    cleDisplayCentersForReferentClasse: boolean;
    cleDisplayCentersForReferentClasseDate: { from?: Date; to?: Date };
    cleDisplayPDRForAdminCLE: boolean;
    cleDisplayPDRForAdminCLEDate: { from?: Date; to?: Date };
    cleDisplayPDRForReferentClasse: boolean;
    cleDisplayPDRForReferentClasseDate: { from?: Date; to?: Date };
    validationDate?: Date;
    validationDateForTerminaleGrade?: Date;
    youngCheckinForAdmin?: boolean;
    youngCheckinForHeadOfCenter?: boolean;
    youngCheckinForRegionReferent?: boolean;
    youngCheckinForDepartmentReferent?: boolean;
    busListAvailability?: boolean;
    sessionEditionOpenForReferentRegion: boolean;
    sessionEditionOpenForReferentDepartment: boolean;
    sessionEditionOpenForTransporter: boolean;
    pdrEditionOpenForReferentRegion: boolean;
    pdrEditionOpenForReferentDepartment: boolean;
    pdrEditionOpenForTransporter: boolean;
    informationsConvoyage?: {
        editionOpenForReferentRegion: boolean;
        editionOpenForReferentDepartment: boolean;
        editionOpenForHeadOfCenter: boolean;
    };
    repartitionSchemaCreateAndEditGroupAvailability?: boolean;
    repartitionSchemaDownloadAvailability?: boolean;
    isTransportPlanCorrectionRequestOpen?: boolean;
    schemaAccessForReferentRegion: boolean;
    schemaAccessForReferentDepartment: boolean;
    busEditionOpenForTransporter: boolean;
    daysToValidate: number;
    daysToValidateForTerminalGrade?: number;
    type: string;
    createdAt: Date;
    updatedAt: Date;
    inscriptionOpenForReferentClasse: boolean;
    inscriptionOpenForReferentRegion: boolean;
    inscriptionOpenForReferentDepartment: boolean;
    inscriptionOpenForAdministrateurCle: boolean;
};

export type CreateSessionModel = Omit<
    SessionModel,
    | "id"
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
>;
