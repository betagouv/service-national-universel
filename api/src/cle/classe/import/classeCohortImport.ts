export enum ClasseCohortImportKey {
  SEPT_2024 = "SEPT_2024",
}

export interface ClasseCohortImportBody {
  filePath: string;
  classeCohortImportKey: ClasseCohortImportKey;
}

export interface ClasseCohortCSV {
  classe: string;
  cohort: string;
}

export interface ClasseCohortImportResult {
  classeId: string;
  cohortId: string;
  cohortName?: string;
  result?: "success" | "error";
  error?: "success" | string;
}
