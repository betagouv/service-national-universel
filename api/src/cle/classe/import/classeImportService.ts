import { getFile } from "../../../utils";
import { readCSVBuffer } from "../../../services/fileService";
import { ClasseCohortCSV, ClasseCohortImportKey, ClasseCohortImportResult } from "./classeCohortImport";
import { mapClassesCohortsForSept2024 } from "./classeCohortMapper";
import { ClasseDocument, ClasseModel, CohortModel } from "../../../models";
import { ERRORS } from "snu-lib";
import { findCohortBySnuIdOrThrow } from "../../../cohort/cohortService";

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
      classeCohortImportResult.result = "success";
      classeCohortImportResult.cohortId = updatedClasse.cohortId;
      classeCohortImportResult.cohortCode = classeCohortToImport.cohortCode;
      classeCohortImportResult.cohortName = updatedClasse.cohort;
    } catch (error) {
      console.error(error);
      classeCohortImportResult.result = "error";
      classeCohortImportResult.error = error.message;
    } finally {
      classesCohortsImportResult.push(classeCohortImportResult);
    }
  }
  return classesCohortsImportResult;
};

export const addCohortToClasseByCohortSnuId = async (classeId: string, cohortSnuId: string | undefined, classeCohortImportKey: ClasseCohortImportKey) => {
  if (!cohortSnuId) {
    throw new Error(ERRORS.INVALID_PARAMS);
  }
  const cohort = await findCohortBySnuIdOrThrow(cohortSnuId);
  return addCohortToClasse(classeId, cohort._id, classeCohortImportKey);
};

export const addCohortToClasse = async (classeId: string, cohortId: string, classeCohortImportKey: ClasseCohortImportKey) => {
  if (!classeId || !cohortId) {
    throw new Error(ERRORS.INVALID_PARAMS);
  }
  const cohort = await CohortModel.findById(cohortId);
  if (!cohort) {
    throw new Error(ERRORS.COHORT_NOT_FOUND);
  }
  const classe = await ClasseModel.findById(classeId);
  if (!classe) {
    throw new Error(ERRORS.CLASSE_NOT_FOUND);
  }
  classe.set({ cohortId: cohortId, cohort: cohort.name });
  console.log(`classeImportService - addCohortToClasse() - Classe ${classeId} updated with cohort ${cohortId} - ${cohort.name}`);
  return classe.save({ fromUser: { firstName: `IMPORT_CLASSE_COHORT_${classeCohortImportKey}` } });
};
