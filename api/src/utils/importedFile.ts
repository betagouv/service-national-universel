import fs from "fs";
import { randomUUID } from "crypto";
import { UploadedFile } from "express-fileupload";

import { ERRORS, MIME_TYPES } from "snu-lib";
import { logger } from "../logger";
import { getMimeFromFile } from "./file";
import { scanFile } from "./virusScanner";

export type ImportedFileKind = "csv" | "xlsx";

// Octets lus pour vérifier qu'un CSV est bien du texte : un binaire renommé porte des octets nuls dès l'en-tête.
const TEXT_PROBE_SIZE = 64 * 1024;

/**
 * Clé de stockage d'un fichier importé, générée côté serveur.
 *
 * Le nom envoyé par le client n'entre jamais dans la clé : il pouvait contenir des `/` ou `..`, écraser un
 * fichier existant du dossier ou en viser un autre (L32, L33, audit du 21/09/2026).
 */
export function buildImportedFileKey(folder: string, kind: ImportedFileKind, date: Date = new Date()): string {
  const timestamp = date.toISOString().replaceAll(":", "-").replace(".", "-");
  return `${folder}/${timestamp}-${randomUUID()}.${kind}`;
}

function isText(filePath: string): boolean {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(TEXT_PROBE_SIZE);
    const bytesRead = fs.readSync(fd, buffer, 0, TEXT_PROBE_SIZE, 0);
    return !buffer.subarray(0, bytesRead).includes(0);
  } finally {
    fs.closeSync(fd);
  }
}

/**
 * Vérifie un fichier importé par son contenu (le type MIME déclaré par le client n'engage que lui) et le passe
 * à l'antivirus quand `ENABLE_ANTIVIRUS` est actif. Lève `UNSUPPORTED_TYPE` ou `FILE_INFECTED`.
 */
export async function assertImportedFile(file: UploadedFile, kind: ImportedFileKind, userId?: string): Promise<void> {
  const detectedMime = await getMimeFromFile(file.tempFilePath);
  // file-type ne reconnaît que les formats binaires : un CSV n'a pas de signature, il doit n'en présenter aucune.
  const isExpectedType = kind === "xlsx" ? detectedMime === MIME_TYPES.EXCEL : detectedMime === null && isText(file.tempFilePath);
  if (!isExpectedType) {
    throw new Error(ERRORS.UNSUPPORTED_TYPE);
  }

  const { infected } = await scanFile(file.tempFilePath, "import", userId);
  if (infected) {
    throw new Error(ERRORS.FILE_INFECTED);
  }
}

/** Supprime le fichier temporaire écrit par express-fileupload (`useTempFiles`), qui n'est jamais purgé sinon. */
export function removeTempFile(file?: UploadedFile): void {
  if (!file?.tempFilePath) return;
  fs.rm(file.tempFilePath, { force: true }, (error) => {
    if (error) logger.warn(`Fichier temporaire d'import non supprimé : ${error.message}`);
  });
}
