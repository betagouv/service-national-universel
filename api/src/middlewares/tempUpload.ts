import fs from "fs";
import { Request, RequestHandler } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import { EventEmitter } from "events";
import { IncomingMessage } from "http";
import { Readable } from "stream";
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

// Au dépassement de la limite de taille, busboy cesse d'écrire le fichier mais ne le termine qu'au délimiteur suivant, et
// express-fileupload arrête son délai d'envoi : tant que la partie ne se termine pas, le fichier n'est ni dans req.files ni
// abandonné par ce délai. Il l'est donc à la fermeture de la connexion, comme il l'aurait été par le délai : express-fileupload
// supprime alors le fichier et referme son descripteur.
function abandonTruncatedFilesOnClose(req: IncomingMessage, parser: EventEmitter) {
  parser.on("file", (_field: string, file: Readable) => {
    file.once("limit", () => {
      const { socket } = req;
      const abandon = () => {
        // Le parseur ne signalera plus sa fin : un fichier reçu ensuite ne serait jamais purgé, l'analyse s'arrête donc ici.
        req.unpipe();
        req.resume();
        file.destroy(new Error("tempUpload: connexion fermée avant la fin d'un fichier trop gros"));
      };
      socket.once("close", abandon);
      file.once("close", () => socket.off("close", abandon));
    });
  });
}

// express-fileupload, dont un fichier trop gros est abandonné à la fermeture de la connexion si sa partie n'est pas terminée.
// La dépendance ne donne pas accès aux fichiers en cours de réception : on récupère le parseur qu'elle branche sur la requête.
// Une requête dont la réponse se ferme avant la fin de l'analyse (connexion coupée, ou réponse déjà envoyée) n'est pas transmise
// au gestionnaire. Ses fichiers déjà reçus sont purgés à cette fermeture, puis à la fin de l'analyse ; le fichier en cours l'est
// par express-fileupload, à la fermeture de la connexion s'il est trop gros, sinon à son délai d'envoi.
export function abandonableFileUpload(options: fileUpload.Options): RequestHandler {
  const parseMultipart = fileUpload(options);
  return (req, res, next) => {
    let closed = false;
    let handedOver = false;
    res.once("close", () => {
      closed = true;
      if (!handedOver) void removeTempFiles(requestFiles(req));
    });
    const pipe = req.pipe;
    req.pipe = function (parser, pipeOptions) {
      req.pipe = pipe;
      abandonTruncatedFilesOnClose(req, parser);
      return pipe.call(this, parser, pipeOptions);
    };
    try {
      parseMultipart(req, res, (err?: unknown) => {
        if (closed) return void removeTempFiles(requestFiles(req));
        handedOver = true;
        next(err);
      });
    } finally {
      req.pipe = pipe;
    }
  };
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
  const upload = abandonableFileUpload({
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
