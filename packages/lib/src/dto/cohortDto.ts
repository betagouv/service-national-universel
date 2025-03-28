import { CohortGroupType } from "../mongoSchema";

export type Eligibility = {
  zones?: string[];
  schoolLevels?: string[];
  bornAfter?: Date | null;
  bornBefore?: Date | null;
};

export type CohortDto = {
  _id?: string;
  snuId: string;
  name: string;
  status: string;
  type: string;
  dateStart: Date;
  cohortGroupId: string;
  cohortGroup?: CohortGroupType;
  dateEnd: Date;
  inscriptionStartDate: Date;
  inscriptionEndDate: Date;
  reInscriptionStartDate?: Date | null;
  reInscriptionEndDate?: Date | null;
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
  cleUpdateCohortForReferentDepartment?: boolean;
  cleDisplayCohortsForAdminCLE?: boolean;
  cleDisplayCohortsForAdminCLEDate?: ToFromDate;
  cleDisplayCohortsForReferentClasse?: boolean;
  cleDisplayCohortsForReferentClasseDate?: ToFromDate;
  cleUpdateCentersForReferentRegion?: boolean;
  cleUpdateCentersForReferentDepartment?: boolean;
  cleDisplayCentersForAdminCLE?: boolean;
  cleDisplayCentersForReferentClasse?: boolean;
  cleDisplayPDRForAdminCLE?: boolean;
  cleDisplayPDRForReferentClasse?: boolean;
  cleUpdateCohortForReferentRegionDate?: ToFromDate;
  cleUpdateCohortForReferentDepartmentDate?: ToFromDate;
  cleUpdateCentersForReferentRegionDate?: ToFromDate;
  cleUpdateCentersForReferentDepartmentDate?: ToFromDate;
  cleDisplayCentersForAdminCLEDate?: ToFromDate;
  cleDisplayCentersForReferentClasseDate?: ToFromDate;
  cleDisplayPDRForAdminCLEDate?: ToFromDate;
  cleDisplayPDRForReferentClasseDate?: ToFromDate;
  busListAvailability?: boolean;
  youngCheckinForHeadOfCenter?: boolean;
  youngCheckinForAdmin?: boolean;
  youngCheckinForRegionReferent?: boolean;
  youngCheckinForDepartmentReferent?: boolean;
  daysToValidate?: number | null;
  objectifLevel?: "departemental" | "regional";
  youngHTSBasculeLPDisabled?: boolean;
  uselessInformation?: Record<string, any> | null;
  validationDate?: Date | null;
  validationDateForTerminaleGrade?: Date | null;
  daysToValidateForTerminalGrade?: number | null;
  informationsConvoyage?: {
    editionOpenForReferentRegion?: boolean;
    editionOpenForReferentDepartment?: boolean;
    editionOpenForHeadOfCenter?: boolean;
  } | null;
  eligibility?: Eligibility;
  inscriptionOpenForReferentClasse?: boolean;
  inscriptionOpenForReferentRegion?: boolean;
  inscriptionOpenForReferentDepartment?: boolean;
  inscriptionOpenForAdministrateurCle?: boolean;
  specificSnuIdCohort?: boolean;
  //virtual
  isInscriptionOpen?: boolean;
  isInstructionOpen?: boolean;
  isReInscriptionOpen?: boolean;
};

export type UpdateCohortDto = Omit<CohortDto, "name" | "type" | "snuId" | "eligibility" | "isInscriptionOpen" | "isInstructionOpen" | "isReInscriptionOpen">;

type ToFromDate = {
  from?: string | null;
  to?: string | null;
};
