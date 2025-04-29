import { CLASSE_IMPORT_EN_MASSE_COLUMNS } from "snu-lib";
import * as XLSX from "xlsx";

interface ValidationResult {
  valid: boolean;
  columns?: string[];
  error?: string;
}

export const validateColumnsName = async (file: File): Promise<ValidationResult> => {
  try {
    // Read the Excel file
    const buffer = await readFileAsBuffer(file);
    const workbook = XLSX.read(buffer, { type: "array" });

    // Check if the file has exactly one sheet
    if (workbook.SheetNames.length !== 1) {
      return {
        valid: false,
        error: "Le fichier doit contenir une seule feuille de calcul",
      };
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Extract headers from the first row
    const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0];
    if (!Array.isArray(headers)) {
      return {
        valid: false,
        error: "Impossible d'extraire les en-têtes du fichier Excel",
      };
    }

    const columns = headers.map((header) => String(header).trim());

    // Check if the required columns are present (case insensitive check)
    const requiredColumns = Object.values(CLASSE_IMPORT_EN_MASSE_COLUMNS);
    const missingColumns = requiredColumns.filter((required) => !columns.some((col) => col.toLowerCase().includes(String(required).toLowerCase())));

    if (missingColumns.length > 0) {
      return {
        valid: false,
        columns: columns,
        error: `Colonnes manquantes: ${missingColumns.join(", ")}`,
      };
    }

    return {
      valid: true,
      columns,
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Erreur lors de la lecture du fichier",
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
