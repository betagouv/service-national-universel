import { STATUS_CLASSE } from "snu-lib";
import { ClasseDocument } from "../../../models";

export enum ClasseCohortImportKey {
  SEPT_2024 = "SEPT_2024",
}

export enum ClasseImportType {
  FIRST_CLASSE_COHORT = "FIRST_CLASSE_COHORT",
  NEXT_CLASSE_COHORT = "NEXT_CLASSE_COHORT",
  PDR_AND_CENTER = "PDR_AND_CENTER",
}

export interface ClasseCohortImportBody {
  filePath: string;
  classeCohortImportKey: ClasseCohortImportKey;
  importType: ClasseImportType;
}

export interface ClasseCohortCSV {
  "Session formule": string;
  "Identifiant de la classe engagée": string;
  "Effectif de jeunes concernés": number;
  "Session : Code de la session"?: string;
  "Désignation du centre"?: string;
  "Code point de rassemblement initial"?: string;
}

export interface ClasseCohortMapped {
  cohortCode?: string;
  classeId: string;
  classeTotalSeats?: number;
  centerCode?: string;
  pdrCode?: string;
  sessionCode?: string;
}

export interface ClasseCohortImportResult extends ClasseCohortMapped {
  classeStatus?: keyof typeof STATUS_CLASSE;
  cohortId?: string;
  cohortName?: string;
  importType?: ClasseImportType;
  result?: "success" | "error";
  error?: string;
  updated?: string;
}

export type AddCohortToClasseResult = {
  updatedClasse: ClasseDocument;
  updatedFields: string[];
  error: string[];
};
