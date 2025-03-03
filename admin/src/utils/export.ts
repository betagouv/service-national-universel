import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

export function saveAsExcelFile(sheets: Record<string, any[]>, fileName: string) {
  const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const workbook = {
    Sheets: Object.entries(sheets).reduce(
      (acc, [name, jeunes]) => {
        acc[name] = XLSX.utils.json_to_sheet(jeunes);
        return acc;
      },
      {} as Record<string, XLSX.WorkSheet>,
    ),
    SheetNames: Object.keys(sheets),
  };
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: fileType });
  const now = new Date();
  const exportDate = `${now.getFullYear()}${now.getMonth() + 1}${("0" + now.getDate()).slice(-2)}`;
  const exportTime = `${now.getHours()}${now.getMinutes()}`;
  FileSaver.saveAs(blob, `${fileName}_${exportDate}_${exportTime}.xlsx`);
}
