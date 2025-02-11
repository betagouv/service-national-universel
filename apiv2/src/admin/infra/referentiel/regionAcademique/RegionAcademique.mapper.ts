import { RegionAcademiqueType } from "snu-lib";
import { RegionAcademiqueModel } from "../../../core/referentiel/regionAcademique/RegionAcademique.model";
import { RegionAcademiqueDocument } from "./RegionAcademiqueMongo.provider";

export class RegionAcademiqueMapper {
  static toDocument(regionAcademiqueModel: RegionAcademiqueModel): RegionAcademiqueType {
    return {
      _id: regionAcademiqueModel.id,
      code: regionAcademiqueModel.code,
      libelle: regionAcademiqueModel.libelle,
      zone: regionAcademiqueModel.zone,
      date_derniere_modification_si: regionAcademiqueModel.dateDerniereModificationSI,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  static toModel(regionAcademiqueDocument: RegionAcademiqueDocument): RegionAcademiqueModel {
    return {
      id: regionAcademiqueDocument._id.toString(),
      code: regionAcademiqueDocument.code,
      libelle: regionAcademiqueDocument.libelle,
      zone: regionAcademiqueDocument.zone,
      dateDerniereModificationSI: regionAcademiqueDocument.date_derniere_modification_si
    };
  }
}
