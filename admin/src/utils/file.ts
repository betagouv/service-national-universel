import * as FileSaver from "file-saver";
import { MIME_TYPES } from "snu-lib";
import * as XLSX from "xlsx";

export function saveAsExcelFile(sheets: Record<string, any[]>, fileName: string) {
  const fileType = `${MIME_TYPES.EXCEL};charset=UTF-8`;
  const workbook = {
    Sheets: Object.entries(sheets).reduce(
      (acc, [name, data]) => {
        acc[name] = XLSX.utils.json_to_sheet(data);
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
