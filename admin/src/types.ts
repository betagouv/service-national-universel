import { ROLES } from "@/utils";
export type Young = { _id: string };

export type BusLine = { _id: string };

export type User = {
  role: (typeof ROLES)[keyof typeof ROLES];
  structureId?: string;
  subRole?: string;
};

export type Center = {
  academy: string;
  address: string;
  addressVerified: string;
  centerDesignation: string;
  city: string;
  code: string;
  code2022: string;
  cohorts: string[];
  complement: string;
  createdAt: string;
  department: string;
  domain: string;
  name: string;
  placesTotal: number;
  pmr: string;
  region: string;
  sessionStatus: string[];
  typology: string;
  updatedAt: string;
  waitingList: string[];
  zip: string;
  __v: number;
  _id: string;
};

export type Session = {
  _id: string;
  cohort: string;
  placesTotal: number;
  placesLeft: number;
  dateStart: string | null;
  dateEnd: string | null;
  sanitaryContactEmail: string;
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
