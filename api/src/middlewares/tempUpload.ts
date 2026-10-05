import fs from "fs";
import { RequestHandler } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import { ERRORS } from "snu-lib";

import { logger } from "../logger";

export const MAX_UPLOAD_FILES = 10;

type UploadedFiles = fileUpload.FileArray | UploadedFile | UploadedFile[] | null | undefined;

function flattenFiles(files: UploadedFiles): UploadedFile[] {
  if (!files) return [];
  if (Array.isArray(files)) return files;
  if ("tempFilePath" in files && typeof files.name === "string") return [files as UploadedFile];
  return Object.values(files as fileUpload.FileArray).flatMap((entry) => (Array.isArray(entry) ? entry : [entry]));
}

export async function removeTempFiles(files: UploadedFiles): Promise<void> {
  for (const file of flattenFiles(files)) {
    if (!file?.tempFilePath) continue;
    try {
      await fs.promises.rm(file.tempFilePath, { force: true });
    } catch (error) {
      logger.warn(`tempUpload: suppression impossible d'un fichier temporaire: ${error instanceof Error ? error.message : error}`);
    }
  }
}

// Le plafond est monté à MAX+1 : busboy ignore sans bruit les fichiers au-delà, il faut donc en laisser passer un de plus pour détecter le dépassement.
export function tempFileUpload({ tempFileDir = "/tmp/", fileSize = 10 * 1024 * 1024 }: { tempFileDir?: string; fileSize?: number } = {}): RequestHandler[] {
  const purge: RequestHandler = (req, res, next) => {
    res.once("close", () => {
      void removeTempFiles(req.files);
    });
    next();
  };
  const upload = fileUpload({ limits: { fileSize, files: MAX_UPLOAD_FILES + 1 }, abortOnLimit: true, useTempFiles: true, tempFileDir });
  const capFiles: RequestHandler = (req, res, next) => {
    if (flattenFiles(req.files).length > MAX_UPLOAD_FILES) return res.status(413).send({ ok: false, code: ERRORS.INVALID_BODY });
    next();
  };
  return [purge, upload, capFiles];
}
