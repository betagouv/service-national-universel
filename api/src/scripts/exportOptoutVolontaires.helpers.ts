import { MODEL_FIELDS } from "./exportOptoutVolontaires.fields";

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

// Vrai si `value` a la forme d'un ObjectId stocké (hex 24 caractères). Les champs de
// jointure `application.missionId`, `young.classeId/etablissementId` et
// `mission.apiEngagementId` sont typés String et peuvent contenir des valeurs non-ObjectId
// (legacy, JVA, id d'un autre format). Les passer tels quels à une requête `_id: { $in }`
// déclenche une CastError Mongoose qui rejette TOUTE la requête → on filtre en amont.
export function isObjectIdString(value: unknown): boolean {
  return typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);
}

export function youngColumns(): string[] {
  return [...MODEL_FIELDS.young];
}

export function modelColumns(model: Exclude<keyof typeof MODEL_FIELDS, "young">): string[] {
  // "youngEmail" est toujours la 1ère colonne (clé de jointure). Pour "application", le
  // dictionnaire liste aussi "youngEmail" comme champ propre (cf. exportOptoutVolontaires.fields.ts)
  // : sans ce filtre, la colonne apparaîtrait deux fois. ExcelJS ne supporte pas deux colonnes avec
  // la même clé (la 1ère ne reçoit alors jamais de valeur, la 2e est renommée "youngEmail_1" à la
  // relecture SheetJS) — on déduplique donc pour garantir une seule colonne "youngEmail" par onglet.
  return ["youngEmail", ...MODEL_FIELDS[model].filter((f) => f !== "youngEmail")];
}

export function buildRow(doc: Record<string, any>, columns: string[]): Record<string, string | number | boolean | Date | null> {
  const row: Record<string, string | number | boolean | Date | null> = {};
  for (const col of columns) row[col] = toCell(getByPath(doc, col));
  return row;
}
