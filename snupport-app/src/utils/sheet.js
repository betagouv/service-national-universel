// Copie locale de `toSheetCellValue` (snu-lib), que snupport-app n'importe pas. À remplacer par le
// socle partagé de GOO-19.
import * as XLSX from "xlsx";

// SheetJS interprète certaines valeurs au lieu de les écrire : un objet passé à `json_to_sheet` est
// recopié tel quel comme cellule (`{ f: "..." }` compris). Toute cellule est ramenée à un scalaire.
export function toSheetCellValue(value) {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map((item) => (item !== null && typeof item === "object" ? JSON.stringify(item) : String(item ?? ""))).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return String(value);
}

export function safeJsonToSheet(rows, opts) {
  return XLSX.utils.json_to_sheet(
    rows.map((row) => Object.fromEntries(Object.entries(row ?? {}).map(([key, value]) => [key, toSheetCellValue(value)]))),
    opts,
  );
}
