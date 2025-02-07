import { FileValidation } from "../Referentiel";

export interface DepartementImportXlsx {
  "Code département": string;
  "Département : Libellé département long": string;
  "Chef-lieu département": string;
  "Région académique": string;
  "Académie": string;
  "Département : Date de création": string;
  "Département : Date de dernière modification": string;
}

export type DepartementModel = {
  id: string;
  code: string;
  libelle: string;
  chefLieu?: string;
  regionAcademique: string;
  academie: string;
  dateCreationSI: Date;
  dateDerniereModificationSI: Date;
};

export type ImportDepartementModel = Omit<DepartementModel, "id">;
export type CreateDepartementModel = Omit<DepartementModel, "id">;

export interface DepartementRapport {}
export interface DepartementImportRapport extends ImportDepartementModel, DepartementRapport {
    result: "success" | "error";
    error?: string;
    updated?: string;
}

export const DepartementImportFileValidation: FileValidation = {
    requiredColumns: [
        "Code département",
        "Département : Libellé département long",
        "Chef-lieu département",
        "Région académique",
        "Académie",
        "Département : Date de création",
        "Département : Date de dernière modification"
    ],
    sheetName: "",
};

export const DEPARTEMENT_COLUMN_NAMES = {
    code: DepartementImportFileValidation.requiredColumns[0],
    libelle: DepartementImportFileValidation.requiredColumns[1],
    chefLieu: DepartementImportFileValidation.requiredColumns[2],
    regionAcademique: DepartementImportFileValidation.requiredColumns[3],
    academie: DepartementImportFileValidation.requiredColumns[4],
    dateCreationSI: DepartementImportFileValidation.requiredColumns[5],
    dateDerniereModificationSI: DepartementImportFileValidation.requiredColumns[6],
}