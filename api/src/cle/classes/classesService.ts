import { updateReferentByClasseId, UpdateReferentClasse } from "../classe/classeService";
import { ClasseModel, ReferentModel } from "../../models";
import { ERRORS, UserDto } from "snu-lib";

export interface UpdatedReferentReport {
  updatedReferentClasse?: UpdateReferentClasse;
  idClasse?: string;
  previousReferent?: UpdateReferentClasse;
  error?: string;
}

export type UpdatedReferentsReport = UpdatedReferentReport[];

export async function updateReferentsForMultipleClasses(
  referentsClassesToUpdate: (UpdateReferentClasse & {
    idClasse: string;
  })[],
  user: UserDto,
) {
  const updatedReferentsReport: UpdatedReferentsReport = [];
  for (const referentClasse of referentsClassesToUpdate) {
    const { idClasse, ...referent } = referentClasse;
    const updatedReferentReport: UpdatedReferentReport = {
      idClasse,
    };
    const classe = await ClasseModel.findById(idClasse);
    if (!classe) {
      updatedReferentReport.error = ERRORS.CLASSE_NOT_FOUND;
      updatedReferentsReport.push(updatedReferentReport);
      continue;
    }
    const previousReferent = await ReferentModel.findById(classe.referentClasseIds?.[0]);

    if (previousReferent) {
      updatedReferentReport.previousReferent = {
        email: previousReferent?.email || "",
        lastName: previousReferent?.lastName,
        firstName: previousReferent?.firstName,
      };
    }

    const updatedClasse = await updateReferentByClasseId(idClasse, referent, user);
    const newReferentClasse = await ReferentModel.findById(updatedClasse?.referentClasseIds?.[0]);
    updatedReferentReport.updatedReferentClasse = {
      email: newReferentClasse?.email || "",
      lastName: newReferentClasse?.lastName,
      firstName: newReferentClasse?.firstName,
    };

    updatedReferentsReport.push(updatedReferentReport);
  }
  return updatedReferentsReport;
}
