import { RequestHandler } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";

export const MAX_UPLOAD_FILES = 10;

type UploadedFiles = fileUpload.FileArray | UploadedFile | UploadedFile[] | null | undefined;

export async function removeTempFiles(_files: UploadedFiles): Promise<void> {}

export function tempFileUpload({ tempFileDir = "/tmp/", fileSize = 10 * 1024 * 1024 }: { tempFileDir?: string; fileSize?: number } = {}): RequestHandler[] {
  return [fileUpload({ limits: { fileSize }, useTempFiles: true, tempFileDir })];
}
