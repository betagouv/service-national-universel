import * as FileSaver from "file-saver";
import { MIME_TYPES, toSheetCellValue } from "snu-lib";
import * as XLSX from "xlsx";

// Voir `toSheetCellValue` (snu-lib) : aucune valeur brute n'atteint SheetJS.
export function safeAoaToSheet(rows: unknown[][], opts?: XLSX.AOA2SheetOpts): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet(
    rows.map((row) => row.map(toSheetCellValue)),
    opts,
  );
}

export function safeJsonToSheet(rows: Record<string, unknown>[], opts?: XLSX.JSON2SheetOpts): XLSX.WorkSheet {
  return XLSX.utils.json_to_sheet(
    rows.map((row) => Object.fromEntries(Object.entries(row ?? {}).map(([key, value]) => [key, toSheetCellValue(value)]))),
    opts,
  );
}

export function saveAsExcelFile(sheets: Record<string, any[]>, fileName: string) {
  const fileType = `${MIME_TYPES.EXCEL};charset=UTF-8`;
  const workbook = {
    Sheets: Object.entries(sheets).reduce(
      (acc, [name, data]) => {
        acc[name] = safeJsonToSheet(data);
        return acc;
      },
      {} as Record<string, XLSX.WorkSheet>,
    ),
    SheetNames: Object.keys(sheets),
  };
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: fileType });

  FileSaver.saveAs(blob, `${fileName}.xlsx`);
}

export function getDateTimeString(date?: Date) {
  const now = date ? new Date(date) : new Date();
  const exportDate = `${now.getFullYear()}${now.getMonth() + 1}${("0" + now.getDate()).slice(-2)}`;
  const exportTime = `${now.getHours()}${now.getMinutes()}`;
  return `${exportDate}_${exportTime}`;
}
