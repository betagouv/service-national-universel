export interface ImportStep {
  id: string;
  name: string;
  status: string;
}

export interface ImportSummaryResponse {
  cohort;
  busLineCount: number;
  centerCount: number;
  classeCount: number;
  pdrCount: number;
  _id: string;
  maxPdrOnLine: number;
}
