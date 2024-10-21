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
  "Point de Rassemblement : Désignation du Point de Rassemblement": string;
  Adresse: string;
  "Code postal": string;
  Commune: string;
  "Particularités pour accès": string;
  "Région académique": string;
  Académie: string;
  Département: string;
  "Numéro d'ordre": string;
  "Date  début validité de l'enregistrement": string;
  "ID temporaire PDR": string;
}

export type PointDeRassemblementImportMapped = Pick<
  PointDeRassemblementType,
  "name" | "address" | "city" | "zip" | "department" | "region" | "academie" | "particularitesAcces" | "matricule"
> & {
  complementAddress: string;
};
