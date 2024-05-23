import { ROLES } from "@/utils";
export type Young = { _id: string };

export type BusLine = { _id: string };

export type User = {
  role: (typeof ROLES)[keyof typeof ROLES];
  structureId?: string;
  subRole?: string;
};

export type Cohort = {
  name: string;
  type: string;
  dateStart: Date;
  dateEnd: Date;
  inscriptionStartDate: Date;
  inscriptionEndDate: Date;
  inscriptionModificationEndDate?: Date;
  instructionEndDate: Date;
  sessionEditionOpenForReferentRegion?: boolean;
  sessionEditionOpenForReferentDepartment?: boolean;
  sessionEditionOpenForTransporter?: boolean;
  repartitionSchemaCreateAndEditGroupAvailability?: boolean;
  pdrEditionOpenForReferentRegion?: boolean;
  pdrEditionOpenForReferentDepartment?: boolean;
  pdrEditionOpenForTransporter?: boolean;
  schemaAccessForReferentRegion?: boolean;
  schemaAccessForReferentDepartment?: boolean;
  repartitionSchemaDownloadAvailability?: boolean;
  busEditionOpenForTransporter?: boolean;
  isTransportPlanCorrectionRequestOpen?: boolean;
  isAssignmentAnnouncementsOpenForYoung?: boolean;
  manualAffectionOpenForAdmin?: boolean;
  manualAffectionOpenForReferentRegion?: boolean;
  manualAffectionOpenForReferentDepartment?: boolean;
  pdrChoiceLimitDate?: Date | null;
  cleUpdateCohortForReferentRegion?: boolean;
  cleDisplayCohortsForAdminCLE?: boolean;
  cleDisplayCohortsForReferentClasse?: boolean;
  cleUpdateCentersForReferentRegion?: boolean;
  cleDisplayCentersForAdminCLE?: boolean;
  cleDisplayCentersForReferentClasse?: boolean;
  cleDisplayPDRForAdminCLE?: boolean;
  cleDisplayPDRForReferentClasse?: boolean;
  busListAvailability?: boolean;
  youngCheckinForHeadOfCenter?: boolean;
  youngCheckinForAdmin?: boolean;
  youngCheckinForRegionReferent?: boolean;
  youngCheckinForDepartmentReferent?: boolean;
  daysToValidate?: number | null;
  uselessInformation?: object | null;
  validationDate?: Date | null;
  validationDateForTerminaleGrade?: Date | null;
  daysToValidateForTerminalGrade?: number | null;
  informationsConvoyage?: {
    editionOpenForReferentRegion?: boolean;
    editionOpenForReferentDepartment?: boolean;
    editionOpenForHeadOfCenter?: boolean;
  } | null;
};