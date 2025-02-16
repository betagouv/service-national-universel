import { json2csv } from "json-2-csv";

export interface CsvFileOutput {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  encoding: string;
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
    const fullFileName = `${fileName}_${timestamp}.csv`;

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
