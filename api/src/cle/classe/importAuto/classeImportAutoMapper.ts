import { ClasseFromCSV, ClasseMapped } from "./classeImportAutoType";

export const mapClassesForUpdate = (classesChortes: ClasseFromCSV[]): ClasseMapped[] => {
  return classesChortes.map((classeCohorte) => {
    const classeCohorteMapped: ClasseMapped = {
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
