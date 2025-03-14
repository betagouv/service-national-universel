import { DepartementModel } from "@admin/core/referentiel/departement/Departement.model";
import { DepartementDocument } from "./DepartementMongo.provider";
import { DepartementType } from "snu-lib";

export class DepartementMapper {
  static toDocument(departementModel: DepartementModel): DepartementType {
    const { id, ...rest } = departementModel;
    return {
      _id: id,
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static toModel(departementDocument: DepartementDocument): DepartementModel {
    return {
      code: departementDocument.code,
      libelle: departementDocument.libelle,
      academie: departementDocument.academie,
      regionAcademique: departementDocument.regionAcademique,
      chefLieu: departementDocument.chefLieu,
      dateCreationSI: departementDocument.dateCreationSI,
      dateDerniereModificationSI: departementDocument.dateDerniereModificationSI,
      id: departementDocument._id.toString(),
    };
  }
}
