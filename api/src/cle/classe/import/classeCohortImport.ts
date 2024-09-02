import { STATUS_CLASSE } from "snu-lib";

export enum ClasseCohortImportKey {
  SEPT_2024 = "SEPT_2024",
}

export interface ClasseCohortImportBody {
  filePath: string;
  classeCohortImportKey: ClasseCohortImportKey;
}

export interface ClasseCohortCSV {
  "Session : Code de la session": string;
  "Identifiant de la classe engagée": string;
}

export interface ClasseCohortImportResult {
  classeId: string;
  classeStatus?: keyof typeof STATUS_CLASSE;
  cohortId?: string;
  cohortCode?: string;
  cohortName?: string;
  result?: "success" | "error";
  error?: "success" | string;
}
