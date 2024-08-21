import { ClasseCohortCSV, ClasseCohortImportResult } from "./classeCohortImport";

export const mapClassesCohortsForSept2024 = (classesChortes: ClasseCohortCSV[]): Pick<ClasseCohortImportResult, "classeId" | "cohortName">[] => {
  return classesChortes.map((classeCohorte) => ({ classeId: classeCohorte["Identifiant de la classe engagée"], cohortName: classeCohorte["Session: Désignation de la session"] }));
};
