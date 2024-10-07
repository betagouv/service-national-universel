import { ClasseCohortCSV, ClasseCohortMapped } from "./classeCohortImport";

export const mapClassesCohortsForSept2024 = (classesChortes: ClasseCohortCSV[]): ClasseCohortMapped[] => {
  return classesChortes.map((classeCohorte) => {
    const classeCohorteMapped: ClasseCohortMapped = {
      classeId: classeCohorte["Identifiant de la classe engagée"],
      cohortCode: classeCohorte["Session formule"],
      classeTotalSeats: classeCohorte["Effectif de jeunes concernés"],
    };
    return classeCohorteMapped;
  });
};
