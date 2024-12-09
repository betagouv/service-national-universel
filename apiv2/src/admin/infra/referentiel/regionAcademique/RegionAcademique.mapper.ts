import { RegionAcademiqueDto, RegionAcademiqueType } from "snu-lib";
import { CreateRegionAcademiqueModel, RegionAcademiqueModel } from "../../../core/referentiel/regionAcademique/RegionAcademique.model";
import { RegionAcademiqueDocument } from "./RegionAcademiqueMongo.provider";

export class RegionAcademiqueMapper {
  static toDto(regionAcademiqueModel: RegionAcademiqueModel): RegionAcademiqueDto {
    return {
      code: regionAcademiqueModel.code,
      libelle: regionAcademiqueModel.libelle,
      zone: regionAcademiqueModel.zone,
      dateCreationSI: regionAcademiqueModel.dateCreationSI,
      dateDerniereModificationSI: regionAcademiqueModel.dateDerniereModificationSI
    };
  }

  static toModel(regionAcademiqueDocument: RegionAcademiqueDocument): RegionAcademiqueModel {
    return {
      id: regionAcademiqueDocument._id,
      code: regionAcademiqueDocument.code,
      libelle: regionAcademiqueDocument.libelle,
      zone: regionAcademiqueDocument.zone,
      dateCreationSI: regionAcademiqueDocument.date_creation_si,
      dateDerniereModificationSI: regionAcademiqueDocument.date_derniere_modification_si
    };
  }

  static toEntity(regionAcademique: RegionAcademiqueModel): Omit<RegionAcademiqueType, "metadata" | "createdAt" | "updatedAt"> {
    return {
      _id: regionAcademique.id,
      code: regionAcademique.code,
      libelle: regionAcademique.libelle,
      zone: regionAcademique.zone,
      date_creation_si: regionAcademique.dateCreationSI,
      date_derniere_modification_si: regionAcademique.dateDerniereModificationSI,
    };
  }
}
