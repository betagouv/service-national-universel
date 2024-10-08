import { ClasseCohortCSV, ClasseCohortMapped, ClasseImportType } from "./classeCohortImport";
import { FUNCTIONAL_ERRORS } from "snu-lib";

export const mapClassesCohortsForSept2024 = (classesChortes: ClasseCohortCSV[], importType: ClasseImportType): ClasseCohortMapped[] => {
  if (importType === ClasseImportType.PDR_AND_CENTER) {
    return classesChortes.map((classeCohorte) => {
      if (!classeCohorte["Désignation du centre"]) {
        throw new Error(FUNCTIONAL_ERRORS.NO_CENTER_CODE_PROVIDED);
      }
      if (!classeCohorte["Code point de rassemblement initial"]) {
        throw new Error(FUNCTIONAL_ERRORS.NO_PDR_CODE_PROVIDED);
      }
      if (!classeCohorte["Session : Code de la session"]) {
        throw new Error(FUNCTIONAL_ERRORS.NO_SESSION_CODE_PROVIDED);
      }
      const classeCohorteMapped: ClasseCohortMapped = {
        classeId: classeCohorte["Identifiant de la classe engagée"],
        cohortCode: classeCohorte["Session formule"],
        centerCode: classeCohorte["Désignation du centre"],
        pdrCode: classeCohorte["Code point de rassemblement initial"],
        sessionCode: classeCohorte["Session : Code de la session"],
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
