import { getFile } from "../../../utils";
import { readCSVBuffer } from "../../../services/fileService";
import { ClasseCohortCSV, ClasseCohortImportKey, ClasseCohortImportResult, ClasseCohortMapped, ClasseImportType } from "./classeCohortImport";
import { mapClassesCohortsForSept2024 } from "./classeCohortMapper";
import { ClasseDocument, ClasseModel, CohortModel } from "../../../models";
import { ERRORS, FUNCTIONAL_ERRORS, STATUS_CLASSE } from "snu-lib";
import { findCohortBySnuIdOrThrow } from "../../../cohort/cohortService";
import { logger } from "../../../logger";

export const importClasseCohort = async (filePath: string, classeCohortImportKey: ClasseCohortImportKey, importType: ClasseImportType) => {
  const classeCohortFile = await getFile(filePath);
  const classesCohortsToImport: ClasseCohortCSV[] = await readCSVBuffer<ClasseCohortCSV>(Buffer.from(classeCohortFile.Body), true);

  const classesCohortsToImportMapped = mapClassesCohortsForSept2024(classesCohortsToImport);
  if (classeCohortImportKey !== ClasseCohortImportKey.SEPT_2024) {
    // use another mapper
  }

  const classesCohortsImportResult: ClasseCohortImportResult[] = [];
  for (const classeCohortToImportMapped of classesCohortsToImportMapped) {
    const classeCohortImportResult: ClasseCohortImportResult = { ...classeCohortToImportMapped };
    try {
      const updatedClasse: ClasseDocument = await addCohortToClasseByCohortSnuId(classeCohortToImportMapped, classeCohortImportKey, importType);
      classeCohortImportResult.cohortId = updatedClasse.cohortId;
      classeCohortImportResult.cohortName = updatedClasse.cohort;
      classeCohortImportResult.classeStatus = updatedClasse.status;
      classeCohortImportResult.classeEstimatedSeats = updatedClasse.estimatedSeats;
      classeCohortImportResult.result = "success";
    } catch (error) {
      logger.warn(error.stack);
      classeCohortImportResult.classeEstimatedSeats = undefined;
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
) => {
  if (!classeCohortToImportMapped.cohortCode) {
    throw new Error(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  }
  const cohort = await findCohortBySnuIdOrThrow(classeCohortToImportMapped.cohortCode);
  return addCohortToClasse(classeCohortToImportMapped, cohort._id, classeCohortImportKey, importType);
};

export const addCohortToClasse = async (
  classeCohortToImportMapped: ClasseCohortMapped,
  cohortId: string,
  classeCohortImportKey: ClasseCohortImportKey,
  importType: ClasseImportType,
) => {
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
  if (importType === ClasseImportType.FIRST_CLASSE_COHORT) {
    classe.set({ cohortId: cohortId, cohort: cohort.name, status: STATUS_CLASSE.ASSIGNED, estimatedSeats: classeCohortToImportMapped.classeEstimatedSeats });
  } else if (importType === ClasseImportType.NEXT_CLASSE_COHORT) {
    classe.set({ cohortId: cohortId, cohort: cohort.name, estimatedSeats: classeCohortToImportMapped.classeEstimatedSeats });
  } else if (importType === ClasseImportType.PDR_AND_CENTER) {
    classe.set({ cohortId: cohortId, cohort: cohort.name, estimatedSeats: classeCohortToImportMapped.classeEstimatedSeats });
  }
  logger.info(`classeImportService - addCohortToClasse() - Classe ${classeCohortToImportMapped.classeId} updated with cohort ${cohortId} - ${cohort.name}`);
  return classe.save({ fromUser: { firstName: `IMPORT_CLASSE_COHORT_${classeCohortImportKey}` } });
};

export const processPdrAndCenter = () => {
  // TODO:
};
