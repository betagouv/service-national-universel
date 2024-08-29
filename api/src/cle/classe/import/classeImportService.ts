import { getFile } from "../../../utils";
import { readCSVBuffer } from "../../../services/fileService";
import { ClasseCohortCSV, ClasseCohortImportKey, ClasseCohortImportResult } from "./classeCohortImport";
import { mapClassesCohortsForSept2024 } from "./classeCohortMapper";
import { ClasseDocument, ClasseModel, CohortModel } from "../../../models";
import { ERRORS, FUNCTIONAL_ERRORS, STATUS_CLASSE } from "snu-lib";
import { findCohortBySnuIdOrThrow } from "../../../cohort/cohortService";
import { capture } from "../../../sentry";
import { logger } from "../../../logger";

export const importClasseCohort = async (filePath: string, classeCohortImportKey: ClasseCohortImportKey) => {
  const classeCohortFile = await getFile(filePath);
  const classesCohortsToImport: ClasseCohortCSV[] = await readCSVBuffer<ClasseCohortCSV>(Buffer.from(classeCohortFile.Body), true);

  const classesCohortsToImportMapped = mapClassesCohortsForSept2024(classesCohortsToImport);
  if (classeCohortImportKey !== ClasseCohortImportKey.SEPT_2024) {
    // use another mapper
  }

  const classesCohortsImportResult: ClasseCohortImportResult[] = [];
  for (const classeCohortToImport of classesCohortsToImportMapped) {
    const classeCohortImportResult: ClasseCohortImportResult = { ...classeCohortToImport };
    try {
      const updatedClasse: ClasseDocument = await addCohortToClasseByCohortSnuId(classeCohortToImport.classeId, classeCohortToImport.cohortCode, classeCohortImportKey);
      classeCohortImportResult.cohortId = updatedClasse.cohortId;
      classeCohortImportResult.cohortName = updatedClasse.cohort;
      classeCohortImportResult.classeStatus = updatedClasse.status;
      classeCohortImportResult.result = "success";
    } catch (error) {
      logger.error(error.stack);
      classeCohortImportResult.result = "error";
      classeCohortImportResult.error = error.message;
    } finally {
      classeCohortImportResult.cohortCode = classeCohortToImport.cohortCode;
      classesCohortsImportResult.push(classeCohortImportResult);
    }
  }
  return classesCohortsImportResult;
};

export const addCohortToClasseByCohortSnuId = async (classeId: string, cohortSnuId: string | undefined, classeCohortImportKey: ClasseCohortImportKey) => {
  if (!cohortSnuId) {
    throw new Error(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  }
  const cohort = await findCohortBySnuIdOrThrow(cohortSnuId);
  return addCohortToClasse(classeId, cohort._id, classeCohortImportKey);
};

export const addCohortToClasse = async (classeId: string, cohortId: string, classeCohortImportKey: ClasseCohortImportKey) => {
  if (!classeId) {
    throw new Error(FUNCTIONAL_ERRORS.NO_CLASSE_ID_PROVIDED);
  }
  if (!cohortId) {
    throw new Error(FUNCTIONAL_ERRORS.NO_COHORT_CODE_PROVIDED);
  }
  const cohort = await CohortModel.findById(cohortId);
  if (!cohort) {
    throw new Error(ERRORS.COHORT_NOT_FOUND);
  }
  const classe = await ClasseModel.findById(classeId);
  if (!classe) {
    throw new Error(ERRORS.CLASSE_NOT_FOUND);
  }
  classe.set({ cohortId: cohortId, cohort: cohort.name, status: STATUS_CLASSE.ASSIGNED });
  logger.info(`classeImportService - addCohortToClasse() - Classe ${classeId} updated with cohort ${cohortId} - ${cohort.name}`);
  return classe.save({ fromUser: { firstName: `IMPORT_CLASSE_COHORT_${classeCohortImportKey}` } });
};
