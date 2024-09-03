import { STATUS_CLASSE } from "snu-lib";

export enum ClasseCohortImportKey {
  SEPT_2024 = "SEPT_2024",
}

export interface ClasseCohortImportBody {
  filePath: string;
  classeCohortImportKey: ClasseCohortImportKey;
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
  result?: "success" | "error";
  error?: "success" | string;
}
