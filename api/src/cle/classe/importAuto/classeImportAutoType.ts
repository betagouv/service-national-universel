import { STATUS_CLASSE } from "snu-lib";
import { ClasseDocument } from "../../../models";

export interface ClasseFromCSV {
  "Session formule": string;
  "Identifiant de la classe engagée": string;
  "Effectif de jeunes concernés": number;
  "Session : Code de la session"?: string;
  "Désignation du centre"?: string;
  "Code point de rassemblement initial"?: string;
}

export interface ClasseMapped {
  cohortCode?: string;
  classeId: string;
  classeTotalSeats?: number;
  centerCode?: string;
  pdrCode?: string;
  sessionCode?: string;
}

export interface ClasseUpdateResult extends ClasseMapped {
  classeStatus?: keyof typeof STATUS_CLASSE;
  cohortId?: string;
  cohortName?: string;
  result?: "success" | "error";
  error?: string;
  updated?: string;
}

export type ClasseUpdateFileResult = {
  updatedClasse: ClasseDocument;
  updatedFields: string[];
  error: string[];
};
