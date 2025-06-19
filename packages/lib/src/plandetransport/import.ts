export interface PdtErrors {
  [key: string]: { line: number; error: string; extra?: string }[];
}
