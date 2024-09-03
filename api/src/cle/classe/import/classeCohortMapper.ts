import { ClasseCohortCSV, ClasseCohortMapped } from "./classeCohortImport";

export const mapClassesCohortsForSept2024 = (classesChortes: ClasseCohortCSV[]): ClasseCohortMapped[] => {
  return classesChortes.map((classeCohorte) => ({
    classeId: classeCohorte["Identifiant de la classe engagée"],
    cohortCode: classeCohorte["Session formule"],
    classeEstimatedSeats: classeCohorte["Effectif de jeunes concernés"],
  }));
};
