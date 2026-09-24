import { json2csv } from "json-2-csv";

export interface CsvFileOutput {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  encoding: string;
}

/**
 * Formate un nom de fichier CSV à partir d'un champ de formulaire.
 *
 * - Normalise la chaîne et supprime les accents.
 * - Convertit la chaîne en minuscules.
 * - Remplace les espaces par des underscores.
 * - Supprime les caractères non alphanumériques (sauf underscore).
 * - Ajoute l'extension ".csv".
 *
 * @param input - La chaîne issue du champ de formulaire.
 * @returns Le nom de fichier CSV formaté.
 */
export function formatCsvFileName(input: string): string {
  // Normalisation pour supprimer les accents
  const normalized = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Conversion en minuscules
  const lowerCased = normalized.toLowerCase();
  // Remplacement des espaces par des underscores
  const underscored = lowerCased.replace(/\s+/g, "_");
  // Suppression des caractères non alphanumériques (sauf underscore)
  const cleaned = underscored.replace(/[^a-z0-9_]/g, "");
  return `${cleaned}`;
}


/**
 * Neutralise l'injection de formule dans un fichier CSV (CWE-1236).
 *
 * Un tableur qui ouvre un CSV interprète toute cellule commençant par `=`, `+`,
 * `-`, `@`, une tabulation ou un retour chariot comme une formule : un champ
 * saisi par un tiers (nom, message, adresse…) peut alors exécuter du code ou
 * exfiltrer des données à l'ouverture de l'export. On préfixe ces valeurs d'une
 * apostrophe, qui force le tableur à les lire comme du texte.
 *
 * Seules les chaînes sont concernées : un nombre négatif reste un nombre.
 */
const SPREADSHEET_FORMULA_PREFIX = /^[=+\-@\t\r]/;

export function neutralizeSpreadsheetFormula<T>(value: T): T | string {
  if (typeof value !== "string" || !SPREADSHEET_FORMULA_PREFIX.test(value)) return value;
  return `'${value}`;
}

/** Applique `neutralizeSpreadsheetFormula` à chaque cellule d'une ligne (objet ou tableau). */
export function neutralizeSpreadsheetRow<T>(row: T): T {
  if (Array.isArray(row)) return row.map((cell) => neutralizeSpreadsheetFormula(cell)) as T;
  if (!row || typeof row !== "object") return neutralizeSpreadsheetFormula(row) as T;
  return Object.fromEntries(Object.entries(row).map(([key, cell]) => [key, neutralizeSpreadsheetFormula(cell)])) as T;
}

export const generateCsvBuffer = async <T extends Record<string, any>>(
  data: T[],
  fileName: string,
  fields: (keyof T)[]
): Promise<CsvFileOutput> => {
  try {
    const options = {
      keys: fields as string[],
      delimiter: {
        field: ';'
      },
      // L'option excelBOM ajoute automatiquement le Byte Order Mark (BOM)
      // en début de fichier CSV pour que Excel reconnaisse l'encodage UTF-8.
      // Cela permet d'afficher correctement les caractères spéciaux (comme les accents).
      excelBOM: true
    };

    const csv = await json2csv(data.map(neutralizeSpreadsheetRow), options);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fullFileName = `${formatCsvFileName(fileName)}_${timestamp}.csv`;

    return {
      buffer: Buffer.from(csv, "utf-8"),
      filename: fullFileName,
      mimetype: "text/csv",
      encoding: "utf-8",
    };
  } catch (error) {
    console.error("Erreur lors de la génération du CSV:", error);
    throw new Error("Échec de la génération du fichier CSV");
  }
};
