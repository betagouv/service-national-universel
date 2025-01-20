import { BasicRoute, PointDeRassemblementType, RouteResponseBody } from "snu-lib";
import { PointDeRassemblementImportReport } from "./pointDeRassemblementImportService";

export interface ImportPointDeRassemblementRoute extends BasicRoute {
  method: "POST";
  path: "";
  payload: {
    pdrFilePath: string;
  };
  response: RouteResponseBody<PointDeRassemblementImportReport[]>;
}

export interface PointDeRassemblementCSV {
  "Matricule du point de rassemblement": string;
  "Point de Rassemblement : Désignation": string;
  Adresse: string;
  "Code postal": string;
  Commune: string;
  "Particularités pour accès": string;
  "Région académique": string;
  Académie: string;
  Département: string;
  "ID temporaire PDR": string;
  UAI: string;
  "Numéro d'ordre": string;
  "Date  début validité de l'enregistrement": string;
  "Point de Rassemblement : Date de création": string;
  "Point de Rassemblement : Date de dernière modification": string;
}

export type PointDeRassemblementImportMapped = Pick<
  PointDeRassemblementType,
  | "name"
  | "address"
  | "city"
  | "zip"
  | "department"
  | "region"
  | "academie"
  | "particularitesAcces"
  | "matricule"
  | "uai"
  | "numeroOrdre"
  | "dateCreation"
  | "dateDebutValidite"
  | "dateDerniereModification"
> & {
  complementAddress: string;
};

export const PDR_HEADERS = [
  "Matricule du point de rassemblement",
  "Point de Rassemblement : Désignation",
  "Adresse",
  "Code postal",
  "Commune",
  "Particularités pour accès",
  "Région académique",
  "Académie",
  "Département",
  "ID temporaire PDR",
  "UAI",
  "Numéro d'ordre",
  "Date  début validité de l'enregistrement",
  "Point de Rassemblement : Date de création",
  "Point de Rassemblement : Date de dernière modification",
];
