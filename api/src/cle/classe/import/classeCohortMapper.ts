import { ClasseCohortCSV, ClasseCohortImportResult } from "./classeCohortImport";

export const mapClassesCohortsForSept2024 = (classesChortes: ClasseCohortCSV[]): Pick<ClasseCohortImportResult, "classeId" | "cohortId">[] => {
  return classesChortes.map((classeCohorte) => ({ cohortId: classeCohorte.cohort, classeId: classeCohorte.classe }));
};
