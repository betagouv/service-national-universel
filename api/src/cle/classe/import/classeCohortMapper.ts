import { ClasseCohortCSV, ClasseCohortImportResult } from "./classeCohortImport";

export const mapClassesCohortsForSept2024 = (classesChortes: ClasseCohortCSV[]): Pick<ClasseCohortImportResult, "classeId" | "cohortCode">[] => {
  return classesChortes.map((classeCohorte) => ({ classeId: classeCohorte["Identifiant de la classe engagée"], cohortCode: classeCohorte["Session : Code de la session"] }));
};
