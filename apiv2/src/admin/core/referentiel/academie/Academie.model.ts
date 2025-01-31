import { FileValidation } from "../Referentiel";

export interface AcademieImportXlsx {
  "Code académie": string;
  "Académie : Libellé académie long": string;
  "Région académique": string;
  "Académie : Date de création": string;
  "Académie : Date de dernière modification": string;
}

export type AcademieModel = {
  id: string;
  code: string;
  libelle: string;
  regionAcademique: string;
  dateCreationSI: Date;
  dateDerniereModificationSI: Date;
};

export type ImportAcademieModel = Omit<AcademieModel, "id">;
export type CreateAcademieModel = Omit<AcademieModel, "id">;

export interface AcademieRapport {}
export interface AcademieImportRapport extends ImportAcademieModel, AcademieRapport {
    result: "success" | "error";
    error?: string;
    updated?: string;
}

export const AcademieImportFileValidation: FileValidation = {
    requiredColumns: [
        "Code académie",
        "Académie : Libellé académie long",
        "Région académique",
        "Académie : Date de création",
        "Académie : Date de dernière modification"
    ],
    sheetName: "",
};

export const ACADEMIE_COLUMN_NAMES = {
    code: AcademieImportFileValidation.requiredColumns[0],
    libelle: AcademieImportFileValidation.requiredColumns[1],
    regionAcademique: AcademieImportFileValidation.requiredColumns[2],
    dateCreationSI: AcademieImportFileValidation.requiredColumns[3],
    dateDerniereModificationSI: AcademieImportFileValidation.requiredColumns[4],
}