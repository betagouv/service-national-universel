import fs from "fs";
import { Request, RequestHandler } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import { ERRORS } from "snu-lib";

import { logger } from "../logger";

export const MAX_UPLOAD_FILES = 10;

type UploadedFiles = fileUpload.FileArray | UploadedFile | UploadedFile[] | null | undefined;

// `files` est lu avec un type local, comme dans UserRequest (controllers/request.ts) : express-fileupload n'a pas
// de types installés, et le `Request.files` visible dans le monorepo vient de @types/multer (dépendance d'apiv2),
// absent de l'arbre élagué par `turbo prune api` au build de production.
function requestFiles(req: Request): UploadedFiles {
  return (req as Request & { files?: UploadedFiles }).files;
}

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
// Un fichier trop gros ne coupe pas l'analyse : la réponse 413 part tout de suite, mais l'analyse va à son terme pour que tous les fichiers créés soient purgés.
export function tempFileUpload({
  tempFileDir = "/tmp/",
  fileSize = 10 * 1024 * 1024,
  uploadTimeout,
}: { tempFileDir?: string; fileSize?: number; uploadTimeout?: number } = {}): RequestHandler[] {
  const purge: RequestHandler = (req, res, next) => {
    res.once("close", () => {
      void removeTempFiles(requestFiles(req));
    });
    next();
  };
  const upload = fileUpload({
    limits: { fileSize, files: MAX_UPLOAD_FILES + 1 },
    limitHandler: (_req, res) => {
      if (!res.headersSent) res.status(413).send({ ok: false, code: ERRORS.INVALID_BODY });
    },
    useTempFiles: true,
    tempFileDir,
    ...(uploadTimeout !== undefined && { uploadTimeout }),
  });
  const stopIfAnswered: RequestHandler = (req, res, next) => {
    if (!res.headersSent) return next();
    void removeTempFiles(requestFiles(req));
  };
  const capFiles: RequestHandler = (req, res, next) => {
    if (flattenFiles(requestFiles(req)).length > MAX_UPLOAD_FILES) return res.status(413).send({ ok: false, code: ERRORS.INVALID_BODY });
    next();
  };
  return [purge, upload, stopIfAnswered, capFiles];
}
