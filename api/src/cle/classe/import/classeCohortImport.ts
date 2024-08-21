export enum ClasseCohortImportKey {
  SEPT_2024 = "SEPT_2024",
}

export interface ClasseCohortImportBody {
  filePath: string;
  classeCohortImportKey: ClasseCohortImportKey;
}

export interface ClasseCohortCSV {
  "Session: Désignation de la session": string;
  "Identifiant de la classe engagée": string;
}

export interface ClasseCohortImportResult {
  classeId: string;
  cohortId?: string;
  cohortName?: string;
  result?: "success" | "error";
  error?: "success" | string;
}
