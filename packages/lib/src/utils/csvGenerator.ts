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

    const csv = await json2csv(data, options);
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
