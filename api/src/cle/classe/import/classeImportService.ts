import { getFile } from "../../../utils";
import { readCSVBuffer } from "../../../services/fileService";
import { ClasseCohortCSV, ClasseCohortImportKey, ClasseCohortImportResult, ClasseCohortMapped, ClasseImportType, AddCohortToClasseResult } from "./classeCohortImport";
import { mapClassesCohortsForSept2024, mapClassesCohortsForSept2024BIS } from "./classeCohortMapper";
import { ClasseDocument, ClasseModel, CohortDocument, CohortModel, YoungModel, PointDeRassemblementModel, SessionPhase1Model, CohesionCenterModel } from "../../../models";
import { ERRORS, FUNCTIONAL_ERRORS, STATUS_CLASSE, STATUS_PHASE1_CLASSE } from "snu-lib";
import { findCohortBySnuIdOrThrow } from "../../../cohort/cohortService";
import { logger } from "../../../logger";

export const importClasseCohort = async (filePath: string, classeCohortImportKey: ClasseCohortImportKey, importType: ClasseImportType) => {
  const classeCohortFile = await getFile(filePath);
  const classesCohortsToImport: ClasseCohortCSV[] = await readCSVBuffer<ClasseCohortCSV>(Buffer.from(classeCohortFile.Body));

  const classesCohortsToImportMapped = mapClassesCohortsForSept2024(classesCohortsToImport, importType);
  if (classeCohortImportKey !== ClasseCohortImportKey.SEPT_2024) {
    // use another mapper
  }

  const classesCohortsImportResult: ClasseCohortImportResult[] = [];
  for (const classeCohortToImportMapped of classesCohortsToImportMapped) {
    const classeCohortImportResult: ClasseCohortImportResult = { ...classeCohortToImportMapped };
    try {
      const { updatedClasse, updatedFields, error }: AddCohortToClasseResult = await addCohortToClasseByCohortSnuId(classeCohortToImportMapped, classeCohortImportKey, importType);
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
      classeCohortImportResult.cohortCode = classeCohortToImportMapped.cohortCode;
      classeCohortImportResult.importType = importType;
      classesCohortsImportResult.push(classeCohortImportResult);
    }
  }
  return classesCohortsImportResult;
};

export const addCohortToClasseByCohortSnuId = async (
  classeCohortToImportMapped: ClasseCohortMapped,
  classeCohortImportKey: ClasseCohortImportKey,
  importType: ClasseImportType,
): Promise<AddCohortToClasseResult> => {
  if (!classeCohortToImportMapped.cohortCode) {
    throw new Error(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  }
  const cohort = await findCohortBySnuIdOrThrow(classeCohortToImportMapped.cohortCode);
  const { updatedClasse, updatedFields, error } = await addCohortToClasse(classeCohortToImportMapped, cohort._id, classeCohortImportKey, importType);

  return { updatedClasse, updatedFields, error };
};

export const addCohortToClasse = async (
  classeCohortToImportMapped: ClasseCohortMapped,
  cohortId: string,
  classeCohortImportKey: ClasseCohortImportKey,
  importType: ClasseImportType,
): Promise<AddCohortToClasseResult> => {
  if (!classeCohortToImportMapped.classeId) {
    throw new Error(FUNCTIONAL_ERRORS.NO_CLASSE_ID_PROVIDED);
  }
  if (!cohortId) {
    throw new Error(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  }
  const cohort = await CohortModel.findById(cohortId);
  if (!cohort) {
    throw new Error(ERRORS.COHORT_NOT_FOUND);
  }
  const classe = await ClasseModel.findById(classeCohortToImportMapped.classeId);
  if (!classe) {
    throw new Error(ERRORS.CLASSE_NOT_FOUND);
  }

  let updatedFields: string[] = [];
  let error: string[] = [];
  if (importType === ClasseImportType.FIRST_CLASSE_COHORT) {
    classe.set({ cohortId: cohortId, cohort: cohort.name, status: STATUS_CLASSE.ASSIGNED, totalSeats: classeCohortToImportMapped.classeTotalSeats });
    updatedFields.push("cohortId", "cohort", "status", "totalSeats");
    logger.info(`${ClasseImportType.FIRST_CLASSE_COHORT} - Classe ${classeCohortToImportMapped.classeId} updated with cohort ${cohortId} - ${cohort.name}`);
  } else if (importType === ClasseImportType.NEXT_CLASSE_COHORT || importType === ClasseImportType.PDR_AND_CENTER) {
    await updateClasseForNextCohortOrPdrAndCenter(classe, cohort, classeCohortToImportMapped, classeCohortImportKey, updatedFields);

    if (importType === ClasseImportType.PDR_AND_CENTER) {
      await processSessionPhasePdrAndCenter(classeCohortToImportMapped, classe, updatedFields, error);
    }
  }

  await classe.save({ fromUser: { firstName: `IMPORT_CLASSE_COHORT_${classeCohortImportKey}` } });
  return { updatedClasse: classe, updatedFields, error };
};

export const updateYoungsCohorts = async (classeId: string, cohort: CohortDocument, classeCohortImportKey: ClasseCohortImportKey) => {
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
    young.save({ fromUser: { firstName: `IMPORT_CLASSE_COHORT_${classeCohortImportKey}` } });
    logger.info(`classeImportService - updateYoungsCohorts() - Young ${young._id} updated with cohort ${cohort.name} - ${cohort._id}`);
  }
};

export const processSessionPhasePdrAndCenter = async (classeCohortToImportMapped: ClasseCohortMapped, classe: ClasseDocument, updatedFields: string[], error: string[]) => {
  try {
    if (classeCohortToImportMapped.sessionCode) {
      const session = await SessionPhase1Model.findOne({ sejourSnuId: classeCohortToImportMapped.sessionCode });
      if (!session) {
        error.push(ERRORS.SESSION_NOT_FOUND);
      } else {
        classe.set({ sessionId: session._id });
        updatedFields.push("sessionId");

        // Only search for the cohesion center if there is a sessionCode and session is found
        if (classeCohortToImportMapped.centerCode) {
          try {
            const cohesionCenter = await CohesionCenterModel.findOne({ matricule: classeCohortToImportMapped.centerCode });
            if (!cohesionCenter) {
              error.push(ERRORS.COHESION_CENTER_NOT_FOUND);
            } else {
              classe.set({ cohesionCenterId: cohesionCenter._id });
              updatedFields.push("cohesionCenterId");

              // Only search for the PDR if a cohesion center was found
              if (classeCohortToImportMapped.pdrCode) {
                try {
                  const pdr = await PointDeRassemblementModel.findOne({ matricule: classeCohortToImportMapped.pdrCode });
                  console.log("LAAAA", pdr);
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

  logger.info(
    `${ClasseImportType.PDR_AND_CENTER} - Classe ${classeCohortToImportMapped.classeId} updated with Cohort ${classeCohortToImportMapped.cohortCode}, Center ${classeCohortToImportMapped.centerCode}, PDR ${classeCohortToImportMapped.pdrCode}, and Session ${classeCohortToImportMapped.sessionCode}`,
  );
};

export const updateClasseForNextCohortOrPdrAndCenter = async (
  classe: ClasseDocument,
  cohort: CohortDocument,
  classeCohortToImportMapped: ClasseCohortMapped,
  classeCohortImportKey: ClasseCohortImportKey,
  updatedFields: string[],
) => {
  classe.set({ cohortId: cohort._id, cohort: cohort.name, totalSeats: classeCohortToImportMapped.classeTotalSeats });
  updatedFields.push("cohortId", "cohort", "totalSeats");
  if (classe.status === STATUS_CLASSE.VERIFIED) {
    classe.set({ status: STATUS_CLASSE.ASSIGNED });
    updatedFields.push("status");
  }
  if (cohort._id.toString() !== classe.cohortId) {
    await updateYoungsCohorts(classe._id, cohort, classeCohortImportKey);
    updatedFields.push("youngsCohorts");
  }
  logger.info(`${ClasseImportType.NEXT_CLASSE_COHORT} - Classe ${classe._id} updated with cohort ${cohort._id} - ${cohort.name}`);
};

// BIS POC

export const importClasseCohortBIS = async (classesCohortsToImport: ClasseCohortCSV[]) => {
  const classesCohortsToImportMapped = mapClassesCohortsForSept2024BIS(classesCohortsToImport);

  const classesCohortsImportResult: ClasseCohortImportResult[] = [];
  for (const classeCohortToImportMapped of classesCohortsToImportMapped) {
    const classeCohortImportResult: ClasseCohortImportResult = { ...classeCohortToImportMapped };
    try {
      const { updatedClasse, updatedFields, error }: AddCohortToClasseResult = await addCohortToClasseByCohortSnuIdBIS(classeCohortToImportMapped);
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
      classeCohortImportResult.cohortCode = classeCohortToImportMapped.cohortCode;
      classesCohortsImportResult.push(classeCohortImportResult);
    }
  }
  return classesCohortsImportResult;
};

export const addCohortToClasseByCohortSnuIdBIS = async (classeCohortToImportMapped: ClasseCohortMapped): Promise<AddCohortToClasseResult> => {
  if (!classeCohortToImportMapped.classeId) {
    throw new Error(FUNCTIONAL_ERRORS.NO_CLASSE_ID_PROVIDED);
  }
  const classe = await ClasseModel.findById(classeCohortToImportMapped.classeId);
  if (!classe) {
    throw new Error(ERRORS.CLASSE_NOT_FOUND);
  }

  if (!classeCohortToImportMapped.cohortCode) {
    throw new Error(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  }
  const cohort = await findCohortBySnuIdOrThrow(classeCohortToImportMapped.cohortCode);
  const cohortId = cohort._id;

  let updatedFields: string[] = [];
  let error: string[] = [];

  classe.set({ cohortId: cohortId, cohort: cohort.name, totalSeats: classeCohortToImportMapped.classeTotalSeats });
  updatedFields.push("cohortId", "cohort", "totalSeats");

  if (classe.status === STATUS_CLASSE.VERIFIED) {
    classe.set({ status: STATUS_CLASSE.ASSIGNED });
    updatedFields.push("status");
  }
  if (cohortId.toString() !== classe.cohortId) {
    await updateYoungsCohorts(classe._id, cohort, ClasseCohortImportKey.SEPT_2024);
    updatedFields.push("youngsCohorts");
  }

  try {
    if (classeCohortToImportMapped.sessionCode) {
      const session = await SessionPhase1Model.findOne({ sejourSnuId: classeCohortToImportMapped.sessionCode });
      if (!session) {
        error.push(ERRORS.SESSION_NOT_FOUND);
      } else {
        classe.set({ sessionId: session._id });
        updatedFields.push("sessionId");

        // Only search for the cohesion center if there is a sessionCode and session is found
        if (classeCohortToImportMapped.centerCode) {
          try {
            const cohesionCenter = await CohesionCenterModel.findOne({ matricule: classeCohortToImportMapped.centerCode });
            if (!cohesionCenter) {
              error.push(ERRORS.COHESION_CENTER_NOT_FOUND);
            } else {
              classe.set({ cohesionCenterId: cohesionCenter._id });
              updatedFields.push("cohesionCenterId");

              // Only search for the PDR if a cohesion center was found
              if (classeCohortToImportMapped.pdrCode) {
                try {
                  const pdr = await PointDeRassemblementModel.findOne({ matricule: classeCohortToImportMapped.pdrCode });
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

  //await classe.save({ fromUser: { firstName: `IMPORT_CLASSE_COHORT_${ClasseCohortImportKey.SEPT_2024}` } });
  return { updatedClasse: classe, updatedFields, error };
};
