import { ClasseFromCSV, ClasseUpdateResult, ClasseMapped, ClasseUpdateFileResult } from "./classeImportAutoType";
import { mapClassesForUpdate } from "./classeImportAutoMapper";
import { ClasseModel, CohortDocument, YoungModel, PointDeRassemblementModel, SessionPhase1Model, CohesionCenterModel } from "../../../models";
import { ERRORS, FUNCTIONAL_ERRORS, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";
import { findCohortBySnuIdOrThrow } from "../../../cohort/cohortService";
import { logger } from "../../../logger";

const timestamp = `${new Date().toISOString()?.replaceAll(":", "-")?.replace(".", "-")}`;

export const updateClasseFromExport = async (classesCohortsToUpdate: ClasseFromCSV[]) => {
  const classesToUpdateMapped = mapClassesForUpdate(classesCohortsToUpdate);

  const classesToUpdateResult: ClasseUpdateResult[] = [];
  for (const classeToUpdateMapped of classesToUpdateMapped) {
    const classeCohortImportResult: ClasseUpdateResult = { ...classeToUpdateMapped };
    try {
      const { updatedClasse, updatedFields, error }: ClasseUpdateFileResult = await updateClasse(classeToUpdateMapped);
      classeCohortImportResult.cohortId = updatedClasse.cohortId;
      classeCohortImportResult.cohortName = updatedClasse.cohort;
      classeCohortImportResult.classeStatus = updatedClasse.status;
      classeCohortImportResult.classeTotalSeats = updatedClasse.totalSeats;
      classeCohortImportResult.result = "success";
      classeCohortImportResult.updated = updatedFields.join(", ");
      classeCohortImportResult.error = error.length ? error.join(", ") : undefined;
    } catch (error) {
      logger.warn(error.stack);
      classeCohortImportResult.result = "error";
      classeCohortImportResult.error = error.message;
    } finally {
      classeCohortImportResult.cohortCode = classeToUpdateMapped.cohortCode;
      classesToUpdateResult.push(classeCohortImportResult);
    }
  }
  return classesToUpdateResult;
};

export const updateYoungsCohorts = async (classeId: string, cohort: CohortDocument) => {
  const youngsCohortToUpdate = await YoungModel.find({ classeId: classeId });
  for (const young of youngsCohortToUpdate) {
    const originalCohortId = young.cohortId;
    const originalCohortName = young.cohort;
    young.set({
      cohort: cohort.name,
      cohortId: cohort._id,
      originalCohort: originalCohortName,
      originalCohortId: originalCohortId,
      cohortChangeReason: `Import SI-SNU`,
    });
    young.save({ fromUser: { firstName: `UPDATE_CLASSE_COHORT_${timestamp}` } });
    logger.info(`classeImportService - updateYoungsCohorts() - Young ${young._id} updated with cohort ${cohort.name} - ${cohort._id}`);
  }
};

export const updateClasse = async (classeToUpdateMapped: ClasseMapped): Promise<ClasseUpdateFileResult> => {
  if (!classeToUpdateMapped.classeId) {
    throw new Error(FUNCTIONAL_ERRORS.NO_CLASSE_ID_PROVIDED);
  }
  const classe = await ClasseModel.findById(classeToUpdateMapped.classeId);
  if (!classe) {
    throw new Error(ERRORS.CLASSE_NOT_FOUND);
  }

  if (!classeToUpdateMapped.cohortCode) {
    throw new Error(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  }
  const cohort = await findCohortBySnuIdOrThrow(classeToUpdateMapped.cohortCode);
  const cohortId = cohort._id;

  let updatedFields: string[] = [];
  let error: string[] = [];

  if (cohortId.toString() !== classe.cohortId) {
    await updateYoungsCohorts(classe._id, cohort);
    updatedFields.push("youngsCohorts");
  }

  classe.set({ cohortId: cohortId, cohort: cohort.name, totalSeats: classeToUpdateMapped.classeTotalSeats });
  updatedFields.push("cohortId", "cohort", "totalSeats");

  if (classe.status === STATUS_CLASSE.VERIFIED) {
    classe.set({ status: STATUS_CLASSE.ASSIGNED });
    updatedFields.push("status");
  }

  try {
    if (classeToUpdateMapped.sessionCode) {
      const session = await SessionPhase1Model.findOne({ sejourSnuId: classeToUpdateMapped.sessionCode });
      if (!session) {
        error.push(ERRORS.SESSION_NOT_FOUND);
      } else {
        classe.set({ sessionId: session._id });
        updatedFields.push("sessionId");

        // Only search for the cohesion center if there is a sessionCode and session is found
        if (classeToUpdateMapped.centerCode) {
          try {
            const cohesionCenter = await CohesionCenterModel.findOne({ matricule: classeToUpdateMapped.centerCode });
            if (!cohesionCenter) {
              error.push(ERRORS.COHESION_CENTER_NOT_FOUND);
            } else {
              classe.set({ cohesionCenterId: cohesionCenter._id });
              updatedFields.push("cohesionCenterId");

              // Only search for the PDR if a cohesion center was found
              if (classeToUpdateMapped.pdrCode) {
                try {
                  const pdr = await PointDeRassemblementModel.findOne({ matricule: classeToUpdateMapped.pdrCode });
                  if (!pdr) {
                    error.push(ERRORS.PDR_NOT_FOUND);
                  } else {
                    classe.set({ pointDeRassemblementId: pdr._id, statusPhase1: STATUS_PHASE1_CLASSE.AFFECTED });
                    updatedFields.push("pointDeRassemblementId", "statusPhase1");
                  }
                } catch (pdrError) {
                  error.push(`Error finding PDR: ${pdrError.message}`);
                }
              }
            }
          } catch (centerError) {
            error.push(`Error finding cohesion center: ${centerError.message}`);
          }
        }
      }
    }
  } catch (sessionError) {
    error.push(`Error finding session: ${sessionError.message}`);
  }

  await classe.save({ fromUser: { firstName: `UPDATE_CLASSE_COHORT_${timestamp}` } });
  logger.info(`classeImportService - Classe ${classe._id} updated`);
  return { updatedClasse: classe, updatedFields, error };
};
