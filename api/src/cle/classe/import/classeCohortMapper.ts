import { ClasseCohortCSV, ClasseCohortMapped, ClasseImportType } from "./classeCohortImport";

export const mapClassesCohortsForSept2024 = (classesChortes: ClasseCohortCSV[], importType: ClasseImportType): ClasseCohortMapped[] => {
  if (importType === ClasseImportType.PDR_AND_CENTER) {
    return classesChortes.map((classeCohorte) => {
      const classeCohorteMapped: ClasseCohortMapped = {
        classeId: classeCohorte["Identifiant de la classe engagée"],
        cohortCode: classeCohorte["Session formule"],
        classeTotalSeats: classeCohorte["Effectif de jeunes concernés"],
        centerCode: classeCohorte["Désignation du centre"],
        pdrCode: classeCohorte["Code point de rassemblement initial"],
        sessionCode: `${classeCohorte["Session : Code de la session"]}_${classeCohorte["Désignation du centre"]}`,
      };
      return classeCohorteMapped;
    });
  } else {
    return classesChortes.map((classeCohorte) => {
      const classeCohorteMapped: ClasseCohortMapped = {
        classeId: classeCohorte["Identifiant de la classe engagée"],
        cohortCode: classeCohorte["Session formule"],
        classeTotalSeats: classeCohorte["Effectif de jeunes concernés"],
      };
      return classeCohorteMapped;
    });
  }
};

export const mapClassesCohortsForSept2024BIS = (classesChortes: ClasseCohortCSV[]): ClasseCohortMapped[] => {
  return classesChortes.map((classeCohorte) => {
    const classeCohorteMapped: ClasseCohortMapped = {
      classeId: classeCohorte["Identifiant de la classe engagée"],
      cohortCode: classeCohorte["Session formule"],
      classeTotalSeats: classeCohorte["Effectif de jeunes concernés"],
      centerCode: classeCohorte["Désignation du centre"],
      pdrCode: classeCohorte["Code point de rassemblement initial"],
      sessionCode: `${classeCohorte["Session : Code de la session"]}_${classeCohorte["Désignation du centre"]}`,
    };
    return classeCohorteMapped;
  });
};
