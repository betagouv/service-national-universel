import { AcademieType } from "snu-lib";
import { ACADEMIE_COLUMN_NAMES, AcademieModel, ImportAcademieModel } from "@admin/core/referentiel/academie/Academie.model";
import { AcademieDocument } from "./Academie.provider";

export class AcademieMapper {
  static toDocument(academieModel: AcademieModel): AcademieType {
    const { id, ...rest } = academieModel;
    return {
      _id: id,
      ...rest,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static toModel(academieDocument: AcademieDocument): AcademieModel {
    return {
      code: academieDocument.code,
      libelle: academieDocument.libelle,
      regionAcademique: academieDocument.regionAcademique,
      dateCreationSI: academieDocument.dateCreationSI,
      dateDerniereModificationSI: academieDocument.dateDerniereModificationSI,
      id: academieDocument._id.toString(),
    };
  }
}
