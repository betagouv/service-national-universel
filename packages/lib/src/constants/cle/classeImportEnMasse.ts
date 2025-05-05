export enum CLASSE_IMPORT_EN_MASSE_ERRORS {
  INVALID_FILE_FORMAT = "INVALID_FILE_FORMAT",
  EMPTY_FILE = "EMPTY_FILE",
  REQUIRED_COLUMN = "REQUIRED_COLUMN",
  MISSING_COLUMN = "MISSING_COLUMN",
  TOO_MANY_JEUNES = "TOO_MANY_JEUNES",
  INVALID_FORMAT = "INVALID_FORMAT",
  ALREADY_EXIST = "ALREADY_EXIST",
  UAI_NOT_MATCH = "UAI_NOT_MATCH",
}

export enum CLASSE_IMPORT_EN_MASSE_COLUMNS {
  NOM = "Nom",
  PRENOM = "Prénom",
  DATE_DE_NAISSANCE = "Date de naissance",
  GENRE = "Genre",
  UAI = "UAI", // TODO: à supprimer en fonction de la RG
}

export const IMPORT_REQUIRED_COLUMN = {
  [CLASSE_IMPORT_EN_MASSE_COLUMNS.NOM]: { type: "string", maxLength: 255, required: true },
  [CLASSE_IMPORT_EN_MASSE_COLUMNS.PRENOM]: { type: "string", maxLength: 255, required: true },
  [CLASSE_IMPORT_EN_MASSE_COLUMNS.DATE_DE_NAISSANCE]: { type: "date", format: "dd/MM/yyyy", required: true },
  [CLASSE_IMPORT_EN_MASSE_COLUMNS.GENRE]: { type: "value", values: ["M", "F"], required: true },
  [CLASSE_IMPORT_EN_MASSE_COLUMNS.UAI]: { type: "string", minLength: 8, maxLength: 8 },
};

export type ColumnsMapping = Record<CLASSE_IMPORT_EN_MASSE_COLUMNS, string>;
