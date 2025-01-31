import { FileValidation } from "../Referentiel";

export interface RegionAcademiqueImportXlsx {
  "Code région académique": string;
  "Région académique : Libellé région académique long": string;
  "Zone région académique édition": string;
  "Région académique : Date de dernière modification": string;
}

export type RegionAcademiqueModel = {
  id: string;
  code: string;
  libelle: string;
  zone: string;
  dateDerniereModificationSI: Date;
};

export type ImportRegionAcademiqueModel = Omit<RegionAcademiqueModel, "id">;
export type CreateRegionAcademiqueModel = Omit<RegionAcademiqueModel, "id">;

export interface RegionAcademiqueRapport {}
export interface RegionAcademiqueImportRapport extends ImportRegionAcademiqueModel, RegionAcademiqueRapport {
    result: "success" | "error";
    error?: string;
    updated?: string;
}

export const RegionAcademiqueImportFileValidation: FileValidation = {
    requiredColumns: [
        "Code région académique",
        "Région académique : Libellé région académique long",
        "Zone région académique édition",
        "Région académique : Date de dernière modification"
    ],
    sheetName: "",
};

export const REGION_ACADEMIQUE_COLUMN_NAMES = {
    code: RegionAcademiqueImportFileValidation.requiredColumns[0],
    libelle: RegionAcademiqueImportFileValidation.requiredColumns[1],
    zone: RegionAcademiqueImportFileValidation.requiredColumns[2],
    date_derniere_modification_si: RegionAcademiqueImportFileValidation.requiredColumns[3],
}