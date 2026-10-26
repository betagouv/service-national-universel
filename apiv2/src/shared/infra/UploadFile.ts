import { MIME_TYPES } from "snu-lib";

// Les uploads sont gardés en mémoire par multer : sans plafond, un seul fichier peut saturer le heap.
export const MAX_IMPORT_FILE_SIZE = 20 * 1024 * 1024; // 20 Mo

// Signature d'une archive ZIP (« PK\x03\x04 ») : un .xlsx est un conteneur OOXML zippé.
const ZIP_MAGIC_NUMBER = Buffer.from([0x50, 0x4b, 0x03, 0x04]);
const CSV_SAMPLE_SIZE = 8 * 1024;

/**
 * Vérifie que le contenu correspond au type déclaré : le `mimetype` multer est celui
 * annoncé par le client et ne prouve rien.
 */
export function isFileContentMatchingMimetype(file: { buffer?: Buffer; mimetype: string }): boolean {
    const buffer = file.buffer;
    if (!buffer || buffer.length === 0) {
        return false;
    }
    switch (file.mimetype) {
        case MIME_TYPES.EXCEL:
            return buffer.subarray(0, ZIP_MAGIC_NUMBER.length).equals(ZIP_MAGIC_NUMBER);
        case MIME_TYPES.CSV:
            // Pas de signature pour du texte : on refuse un contenu binaire (octet nul).
            return !buffer.subarray(0, CSV_SAMPLE_SIZE).includes(0x00);
        default:
            return false;
    }
}
