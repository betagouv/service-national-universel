import Joi from "joi";
import { UpdateCohortDto } from "snu-lib/src/dto";

export const validateCohortDto = (dto: UpdateCohortDto): Joi.ValidationResult<UpdateCohortDto> => {
  return Joi.object<UpdateCohortDto, true, UpdateCohortDto>({
    // Informations générales
    dateStart: Joi.date().required(),
    dateEnd: Joi.date().required(),
    // Inscriptions (phase 0)
    inscriptionStartDate: Joi.date().required(),
    inscriptionEndDate: Joi.date().required(),
    reInscriptionStartDate: Joi.date().allow(null),
    reInscriptionEndDate: Joi.date().allow(null),
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
  }).validate(dto, { stripUnknown: true });
};

const ToFromDateValidator = Joi.object({
  from: Joi.date().allow(null, ""),
  to: Joi.date().allow(null, ""),
});
