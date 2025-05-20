import { CLASSE_IMPORT_EN_MASSE_COLUMNS, IMPORT_REQUIRED_COLUMN } from "snu-lib";
import * as XLSX from "xlsx";

interface ValidationResult {
  valid: boolean;
  columns?: string[];
}

export const validateColumnsName = async (file: File): Promise<ValidationResult> => {
  try {
    // Read the Excel file
    const buffer = await readFileAsBuffer(file);
    const workbook = XLSX.read(buffer, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Extract headers from the first row
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    if (!Array.isArray(headers)) {
      return {
        valid: false,
      };
    }

    const columns = headers.map((header) => String(header).trim());

    const requiredColumns: CLASSE_IMPORT_EN_MASSE_COLUMNS[] = Object.entries(IMPORT_REQUIRED_COLUMN)
      .filter(([_, column]) => {
        if ("required" in column && column.required) {
          return true;
        }
        return false;
      })
      .map(([key, _]: [CLASSE_IMPORT_EN_MASSE_COLUMNS, (typeof IMPORT_REQUIRED_COLUMN)[CLASSE_IMPORT_EN_MASSE_COLUMNS]]) => key);

    const missingColumns = requiredColumns.filter((requiredColumn) => !columns.includes(requiredColumn));

    if (missingColumns.length > 0) {
      return {
        valid: false,
        columns: columns,
      };
    }

    return {
      valid: true,
      columns,
    };
  } catch (error) {
    return {
      valid: false,
    };
  }
};

// Helper function to read file as buffer
const readFileAsBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = () => reject(new Error("Erreur lors de la lecture du fichier"));
    reader.readAsArrayBuffer(file);
  });
};
