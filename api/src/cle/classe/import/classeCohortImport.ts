import { STATUS_CLASSE } from "snu-lib";

export enum ClasseCohortImportKey {
  SEPT_2024 = "SEPT_2024",
  PDR_AND_CENTER = "PDR_AND_CENTER",
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
}

export interface ClasseCohortMapped {
  cohortCode?: string;
  classeId: string;
  classeEstimatedSeats?: number;
}

export interface ClasseCohortImportResult extends ClasseCohortMapped {
  classeStatus?: keyof typeof STATUS_CLASSE;
  cohortId?: string;
  cohortName?: string;
  importType?: ClasseImportType;
  result?: "success" | "error";
  error?: "success" | string;
}
