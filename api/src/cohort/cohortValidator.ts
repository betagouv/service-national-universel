import Joi from "joi";
import { CohortsRoutes, UpdateCohortDto, INSCRIPTION_GOAL_LEVELS, COHORT_STATUS } from "snu-lib";
import { idSchema } from "../utils/validator";

export const validateCohortDto = (dto: UpdateCohortDto): Joi.ValidationResult<UpdateCohortDto> => {
  return Joi.object<UpdateCohortDto, true, Omit<UpdateCohortDto, "_id">>({
    // Informations générales
    dateStart: Joi.date().required(),
    dateEnd: Joi.date().required(),
    status: Joi.string().valid(COHORT_STATUS.ARCHIVED, COHORT_STATUS.PUBLISHED).required(),
    objectifLevel: Joi.string().valid(INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL, INSCRIPTION_GOAL_LEVELS.REGIONAL).allow(null),
    // Inscriptions (phase 0)
    inscriptionStartDate: Joi.date().required(),
    inscriptionEndDate: Joi.date().required(),
    reInscriptionStartDate: Joi.date().allow(null),
    reInscriptionEndDate: Joi.date().allow(null),
    inscriptionOpenForReferentClasse: Joi.boolean().default(false),
    inscriptionOpenForReferentRegion: Joi.boolean().default(false),
    inscriptionOpenForReferentDepartment: Joi.boolean().default(false),
    inscriptionOpenForAdministrateurCle: Joi.boolean().default(false),
    cohortGroupId: Joi.string().allow(null),
    cohortGroup: cohortGroupSchema,
    // --
    inscriptionModificationEndDate: Joi.date(),
    instructionEndDate: Joi.date().required(),
    // Préparation des affectations et des transports (phase 1)
    sessionEditionOpenForReferentRegion: Joi.boolean(),
    sessionEditionOpenForReferentDepartment: Joi.boolean(),
    sessionEditionOpenForTransporter: Joi.boolean(),
    repartitionSchemaCreateAndEditGroupAvailability: Joi.boolean().default(false),
    pdrEditionOpenForReferentRegion: Joi.boolean(),
    pdrEditionOpenForReferentDepartment: Joi.boolean(),
    pdrEditionOpenForTransporter: Joi.boolean(),
    // --
    schemaAccessForReferentRegion: Joi.boolean(),
    schemaAccessForReferentDepartment: Joi.boolean(),
    repartitionSchemaDownloadAvailability: Joi.boolean(),
    busEditionOpenForTransporter: Joi.boolean(),
    isTransportPlanCorrectionRequestOpen: Joi.boolean(),
    // Affectation et pointage (phase 1)
    isAssignmentAnnouncementsOpenForYoung: Joi.boolean().default(false),
    manualAffectionOpenForAdmin: Joi.boolean().default(false),
    manualAffectionOpenForReferentRegion: Joi.boolean().default(false),
    manualAffectionOpenForReferentDepartment: Joi.boolean().default(false),
    pdrChoiceLimitDate: Joi.date().allow(null, ""),
    // CLE
    cleUpdateCohortForReferentRegion: Joi.boolean().default(false),
    cleDisplayCohortsForAdminCLE: Joi.boolean().default(false),
    cleDisplayCohortsForReferentClasse: Joi.boolean().default(false),
    cleUpdateCentersForReferentRegion: Joi.boolean().default(false),
    cleDisplayCentersForAdminCLE: Joi.boolean().default(false),
    cleDisplayCentersForReferentClasse: Joi.boolean().default(false),
    cleDisplayPDRForAdminCLE: Joi.boolean().default(false),
    cleDisplayPDRForReferentClasse: Joi.boolean().default(false),
    // --
    busListAvailability: Joi.boolean().default(false),
    youngCheckinForHeadOfCenter: Joi.boolean().default(false),
    youngCheckinForAdmin: Joi.boolean().default(false),
    youngCheckinForRegionReferent: Joi.boolean().default(false),
    youngCheckinForDepartmentReferent: Joi.boolean().default(false),
    daysToValidate: Joi.number().allow(null, ""),
    // Autres variables ?!
    uselessInformation: Joi.object().allow(null),
    // Non utilisées dans le formulaire
    validationDate: Joi.date().allow(null, ""),
    validationDateForTerminaleGrade: Joi.date().allow(null, ""),
    daysToValidateForTerminalGrade: Joi.number().allow(null, ""),
    informationsConvoyage: Joi.object({
      editionOpenForReferentRegion: Joi.boolean(),
      editionOpenForReferentDepartment: Joi.boolean(),
      editionOpenForHeadOfCenter: Joi.boolean(),
    }).allow(null),
    cleUpdateCohortForReferentRegionDate: ToFromDateValidator,
    cleUpdateCohortForReferentDepartmentDate: ToFromDateValidator,
    cleUpdateCentersForReferentRegionDate: ToFromDateValidator,
    cleUpdateCentersForReferentDepartmentDate: ToFromDateValidator,
    cleDisplayCentersForAdminCLEDate: ToFromDateValidator,
    cleDisplayCentersForReferentClasseDate: ToFromDateValidator,
    cleDisplayPDRForAdminCLEDate: ToFromDateValidator,
    cleDisplayPDRForReferentClasseDate: ToFromDateValidator,
    cleUpdateCohortForReferentDepartment: Joi.boolean().default(false),
    cleUpdateCentersForReferentDepartment: Joi.boolean().default(false),
    cleDisplayCohortsForAdminCLEDate: ToFromDateValidator,
    cleDisplayCohortsForReferentClasseDate: ToFromDateValidator,
    youngHTSBasculeLPDisabled: Joi.boolean().default(false),
    specificSnuIdCohort: Joi.boolean().default(false),
  }).validate(dto, { stripUnknown: true });
};

type CohortGeneralFields = Pick<UpdateCohortDto, "dateStart" | "dateEnd" | "status" | "cohortGroupId" | "uselessInformation" | "specificSnuIdCohort">;

type ValidatedCohortGeneral = Required<Pick<CohortGeneralFields, "dateStart" | "dateEnd" | "status">> & Partial<Omit<CohortGeneralFields, "dateStart" | "dateEnd" | "status">>;

export const validateCohortGeneralDto = (dto: Partial<CohortGeneralFields>): Joi.ValidationResult<ValidatedCohortGeneral> => {
  return Joi.object<CohortGeneralFields>({
    dateStart: Joi.date().required(),
    dateEnd: Joi.date().required(),
    status: Joi.string().valid(COHORT_STATUS.ARCHIVED, COHORT_STATUS.PUBLISHED, COHORT_STATUS.FULLY_ARCHIVED).required(),
    cohortGroupId: Joi.string().allow(null),
    uselessInformation: Joi.object({
      toolkit: Joi.string().allow(null, "").default(""),
      zones: Joi.string().allow(null, "").default(""),
      eligibility: Joi.string().allow(null, "").default(""),
    }),
    specificSnuIdCohort: Joi.boolean().default(false),
  }).validate(dto, { stripUnknown: true });
};

type CohortInscriptionFields = Pick<
  UpdateCohortDto,
  | "inscriptionStartDate"
  | "inscriptionEndDate"
  | "reInscriptionStartDate"
  | "reInscriptionEndDate"
  | "inscriptionModificationEndDate"
  | "instructionEndDate"
  | "objectifLevel"
  | "youngHTSBasculeLPDisabled"
  | "inscriptionOpenForReferentClasse"
  | "inscriptionOpenForReferentRegion"
  | "inscriptionOpenForReferentDepartment"
  | "inscriptionOpenForAdministrateurCle"
>;

type ValidatedCohortInscription = Required<Pick<CohortInscriptionFields, "inscriptionStartDate" | "inscriptionEndDate" | "instructionEndDate">> &
  Partial<Omit<CohortInscriptionFields, "inscriptionStartDate" | "inscriptionEndDate" | "instructionEndDate">>;

export const validateCohortInscriptionDto = (dto: Partial<CohortInscriptionFields>): Joi.ValidationResult<ValidatedCohortInscription> => {
  return Joi.object<CohortInscriptionFields>({
    inscriptionStartDate: Joi.date().required(),
    inscriptionEndDate: Joi.date().required(),
    reInscriptionStartDate: Joi.date().allow(null),
    reInscriptionEndDate: Joi.date().allow(null),
    inscriptionModificationEndDate: Joi.date(),
    instructionEndDate: Joi.date().required(),
    objectifLevel: Joi.string().valid(INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL, INSCRIPTION_GOAL_LEVELS.REGIONAL).allow(null),
    youngHTSBasculeLPDisabled: Joi.boolean().default(false),
    inscriptionOpenForReferentClasse: Joi.boolean().default(false),
    inscriptionOpenForReferentRegion: Joi.boolean().default(false),
    inscriptionOpenForReferentDepartment: Joi.boolean().default(false),
    inscriptionOpenForAdministrateurCle: Joi.boolean().default(false),
  }).validate(dto, { stripUnknown: true });
};

type CohortTransportFields = Pick<
  UpdateCohortDto,
  | "sessionEditionOpenForReferentRegion"
  | "sessionEditionOpenForReferentDepartment"
  | "sessionEditionOpenForTransporter"
  | "repartitionSchemaCreateAndEditGroupAvailability"
  | "pdrEditionOpenForReferentRegion"
  | "pdrEditionOpenForReferentDepartment"
  | "pdrEditionOpenForTransporter"
  | "schemaAccessForReferentRegion"
  | "schemaAccessForReferentDepartment"
  | "repartitionSchemaDownloadAvailability"
  | "busEditionOpenForTransporter"
  | "isTransportPlanCorrectionRequestOpen"
  | "uselessInformation"
  | "informationsConvoyage"
>;

export const validateCohortPreparationDto = (dto: Partial<CohortTransportFields>): Joi.ValidationResult<CohortTransportFields> => {
  return Joi.object<CohortTransportFields>({
    sessionEditionOpenForReferentRegion: Joi.boolean(),
    sessionEditionOpenForReferentDepartment: Joi.boolean(),
    sessionEditionOpenForTransporter: Joi.boolean(),
    repartitionSchemaCreateAndEditGroupAvailability: Joi.boolean().default(false),
    pdrEditionOpenForReferentRegion: Joi.boolean(),
    pdrEditionOpenForReferentDepartment: Joi.boolean(),
    pdrEditionOpenForTransporter: Joi.boolean(),
    schemaAccessForReferentRegion: Joi.boolean(),
    schemaAccessForReferentDepartment: Joi.boolean(),
    repartitionSchemaDownloadAvailability: Joi.boolean(),
    busEditionOpenForTransporter: Joi.boolean(),
    isTransportPlanCorrectionRequestOpen: Joi.boolean(),
    uselessInformation: Joi.object({
      repartitionSchemaCreateAndEditGroupAvailabilityFrom: Joi.string().allow(null, "").default(""),
      repartitionSchemaCreateAndEditGroupAvailabilityTo: Joi.string().allow(null, "").default(""),
      repartitionSchemaDownloadAvailabilityFrom: Joi.string().allow(null, "").default(""),
      repartitionSchemaDownloadAvailabilityTo: Joi.string().allow(null, "").default(""),
      isTransportPlanCorrectionRequestOpenFrom: Joi.string().allow(null, "").default(""),
      isTransportPlanCorrectionRequestOpenTo: Joi.string().allow(null, "").default(""),
    }),
    informationsConvoyage: Joi.object({
      editionOpenForReferentRegion: Joi.boolean().default(false),
      editionOpenForReferentDepartment: Joi.boolean().default(false),
      editionOpenForHeadOfCenter: Joi.boolean().default(false),
    }),
  }).validate(dto, { stripUnknown: true });
};

type CohortAffectationFields = Pick<
  UpdateCohortDto,
  | "isAssignmentAnnouncementsOpenForYoung"
  | "manualAffectionOpenForAdmin"
  | "manualAffectionOpenForReferentRegion"
  | "manualAffectionOpenForReferentDepartment"
  | "pdrChoiceLimitDate"
  | "busListAvailability"
  | "youngCheckinForHeadOfCenter"
  | "youngCheckinForAdmin"
  | "youngCheckinForRegionReferent"
  | "youngCheckinForDepartmentReferent"
  | "daysToValidate"
  | "uselessInformation"
>;

export const validateCohortAffectationDto = (dto: Partial<CohortAffectationFields>): Joi.ValidationResult<CohortAffectationFields> => {
  return Joi.object<CohortAffectationFields>({
    isAssignmentAnnouncementsOpenForYoung: Joi.boolean().default(false),
    manualAffectionOpenForAdmin: Joi.boolean().default(false),
    manualAffectionOpenForReferentRegion: Joi.boolean().default(false),
    manualAffectionOpenForReferentDepartment: Joi.boolean().default(false),
    pdrChoiceLimitDate: Joi.date().allow(null, ""),
    busListAvailability: Joi.boolean().default(false),
    youngCheckinForHeadOfCenter: Joi.boolean().default(false),
    youngCheckinForAdmin: Joi.boolean().default(false),
    youngCheckinForRegionReferent: Joi.boolean().default(false),
    youngCheckinForDepartmentReferent: Joi.boolean().default(false),
    daysToValidate: Joi.number().allow(null, ""),
    uselessInformation: Joi.object({
      isAssignmentAnnouncementsOpenForYoungFrom: Joi.string().allow(null, "").default(""),
      isAssignmentAnnouncementsOpenForYoungTo: Joi.string().allow(null, "").default(""),
      manualAffectionOpenForAdminFrom: Joi.string().allow(null, "").default(""),
      manualAffectionOpenForAdminTo: Joi.string().allow(null, "").default(""),
      manualAffectionOpenForReferentRegionFrom: Joi.string().allow(null, "").default(""),
      manualAffectionOpenForReferentRegionTo: Joi.string().allow(null, "").default(""),
      manualAffectionOpenForReferentDepartmentFrom: Joi.string().allow(null, "").default(""),
      manualAffectionOpenForReferentDepartmentTo: Joi.string().allow(null, "").default(""),
      busListAvailabilityFrom: Joi.string().allow(null, "").default(""),
      busListAvailabilityTo: Joi.string().allow(null, "").default(""),
      youngCheckinForHeadOfCenterFrom: Joi.string().allow(null, "").default(""),
      youngCheckinForHeadOfCenterTo: Joi.string().allow(null, "").default(""),
      youngCheckinForAdminFrom: Joi.string().allow(null, "").default(""),
      youngCheckinForAdminTo: Joi.string().allow(null, "").default(""),
      youngCheckinForRegionReferentFrom: Joi.string().allow(null, "").default(""),
      youngCheckinForRegionReferentTo: Joi.string().allow(null, "").default(""),
      youngCheckinForDepartmentReferentFrom: Joi.string().allow(null, "").default(""),
      youngCheckinForDepartmentReferentTo: Joi.string().allow(null, "").default(""),
    }),
  }).validate(dto, { stripUnknown: true });
};

type CohortCLEFields = Pick<
  UpdateCohortDto,
  | "cleUpdateCohortForReferentRegion"
  | "cleUpdateCohortForReferentRegionDate"
  | "cleUpdateCohortForReferentDepartment"
  | "cleUpdateCohortForReferentDepartmentDate"
  | "cleDisplayCohortsForAdminCLE"
  | "cleDisplayCohortsForAdminCLEDate"
  | "cleDisplayCohortsForReferentClasse"
  | "cleDisplayCohortsForReferentClasseDate"
  | "cleUpdateCentersForReferentRegion"
  | "cleUpdateCentersForReferentRegionDate"
  | "cleUpdateCentersForReferentDepartment"
  | "cleUpdateCentersForReferentDepartmentDate"
  | "cleDisplayCentersForAdminCLE"
  | "cleDisplayCentersForAdminCLEDate"
  | "cleDisplayCentersForReferentClasse"
  | "cleDisplayCentersForReferentClasseDate"
  | "cleDisplayPDRForAdminCLE"
  | "cleDisplayPDRForAdminCLEDate"
  | "cleDisplayPDRForReferentClasse"
  | "cleDisplayPDRForReferentClasseDate"
>;

export const validateCohortCLEDto = (dto: Partial<CohortCLEFields>): Joi.ValidationResult<CohortCLEFields> => {
  return Joi.object<CohortCLEFields>({
    cleUpdateCohortForReferentRegion: Joi.boolean().default(false),
    cleUpdateCohortForReferentRegionDate: ToFromDateValidator,
    cleUpdateCohortForReferentDepartment: Joi.boolean().default(false),
    cleUpdateCohortForReferentDepartmentDate: ToFromDateValidator,
    cleDisplayCohortsForAdminCLE: Joi.boolean().default(false),
    cleDisplayCohortsForAdminCLEDate: ToFromDateValidator,
    cleDisplayCohortsForReferentClasse: Joi.boolean().default(false),
    cleDisplayCohortsForReferentClasseDate: ToFromDateValidator,
    cleUpdateCentersForReferentRegion: Joi.boolean().default(false),
    cleUpdateCentersForReferentRegionDate: ToFromDateValidator,
    cleUpdateCentersForReferentDepartment: Joi.boolean().default(false),
    cleUpdateCentersForReferentDepartmentDate: ToFromDateValidator,
    cleDisplayCentersForAdminCLE: Joi.boolean().default(false),
    cleDisplayCentersForAdminCLEDate: ToFromDateValidator,
    cleDisplayCentersForReferentClasse: Joi.boolean().default(false),
    cleDisplayCentersForReferentClasseDate: ToFromDateValidator,
    cleDisplayPDRForAdminCLE: Joi.boolean().default(false),
    cleDisplayPDRForAdminCLEDate: ToFromDateValidator,
    cleDisplayPDRForReferentClasse: Joi.boolean().default(false),
    cleDisplayPDRForReferentClasseDate: ToFromDateValidator,
  }).validate(dto, { stripUnknown: true });
};

const ToFromDateValidator = Joi.object({
  from: Joi.date().allow(null, ""),
  to: Joi.date().allow(null, ""),
});

const GetIsIncriptionOpenRouteSchema = {
  query: Joi.object<CohortsRoutes["GetIsIncriptionOpen"]["query"]>({
    sessionName: Joi.string(),
  }),
};

const PostEligibilityRouteSchema = {
  params: Joi.object<CohortsRoutes["PostEligibility"]["params"]>({
    id: idSchema(),
  }),
  query: Joi.object<CohortsRoutes["PostEligibility"]["query"]>({
    getAllSessions: Joi.boolean().default(false),
    type: Joi.string().allow("INSCRIPTION_MANUELLE").allow("BASCULE").allow(null),
  }),
  body: Joi.object<CohortsRoutes["PostEligibility"]["payload"]>({
    schoolDepartment: Joi.string().allow("", null),
    department: Joi.string(),
    region: Joi.string(),
    schoolRegion: Joi.string().allow("", null),
    birthdateAt: Joi.date().required(),
    grade: Joi.string(),
    status: Joi.string(),
    zip: Joi.string().allow("", null),
  }),
};

const cohortGroupSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid("VOLONTAIRE", "CLE").required(),
  year: Joi.number().required(),
}).allow(null);

export const CohortsRoutesSchema = {
  PostEligibility: PostEligibilityRouteSchema,
  GetIsIncriptionOpen: GetIsIncriptionOpenRouteSchema,
};
