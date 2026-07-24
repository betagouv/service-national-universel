import { MODEL_FIELDS, YOUNG_REPRESENTATIVE_FIELDS } from "./exportOptoutVolontaires.fields";

const EXCEL_CELL_MAX = 32767;

export function normalizeEmail(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().toLowerCase() : "";
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export function getByPath(obj: any, path: string): unknown {
  return path.split(".").reduce((acc, seg) => (acc == null ? undefined : acc[seg]), obj);
}

export function toCell(value: unknown): string | number | boolean | Date | null {
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return typeof value === "string" && value.length > EXCEL_CELL_MAX ? value.slice(0, EXCEL_CELL_MAX) : value;
  }
  const json = JSON.stringify(value) ?? "";
  return json.length > EXCEL_CELL_MAX ? json.slice(0, EXCEL_CELL_MAX) : json;
}

export function buildProjection(fields: string[]): Record<string, 1> {
  const proj: Record<string, 1> = {};
  for (const f of fields) proj[f.split(".")[0]] = 1;
  return proj;
}

export function youngColumns(): string[] {
  return [...MODEL_FIELDS.young, ...YOUNG_REPRESENTATIVE_FIELDS];
}

export function modelColumns(model: Exclude<keyof typeof MODEL_FIELDS, "young">): string[] {
  return ["youngEmail", ...MODEL_FIELDS[model]];
}

export function buildRow(doc: Record<string, any>, columns: string[]): Record<string, string | number | boolean | Date | null> {
  const row: Record<string, string | number | boolean | Date | null> = {};
  for (const col of columns) row[col] = toCell(getByPath(doc, col));
  return row;
}
