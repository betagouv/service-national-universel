import fs from "fs";

import { hasAsfSignature } from "snu-lib";

import { loadFileType } from "./loadFileType";

type FileTypeResult = { mime: string } | undefined;
type FileTypeModule = {
  fileTypeFromBuffer: (buffer: Uint8Array) => Promise<FileTypeResult>;
  fileTypeFromFile: (filePath: string) => Promise<FileTypeResult>;
};

// PM33 : aucun format ASF n'est accepté, on écarte sa signature en lisant juste assez d'octets,
// sans lancer la détection. Défense en profondeur seulement : elle n'écarte que la forme directe,
// la protection réelle est la version de file-type (voir loadFileType.js).
const ASF_SIGNATURE_PROBE_SIZE = 10;

async function readsAsAsf(filePath: string): Promise<boolean> {
  const handle = await fs.promises.open(filePath, "r");
  try {
    const buffer = Buffer.alloc(ASF_SIGNATURE_PROBE_SIZE);
    const { bytesRead } = await handle.read(buffer, 0, ASF_SIGNATURE_PROBE_SIZE, 0);
    return hasAsfSignature(buffer.subarray(0, bytesRead));
  } finally {
    await handle.close();
  }
}

export const getMimeFromFile = async (filePath: string) => {
  if (await readsAsAsf(filePath)) return null;
  const { fileTypeFromFile }: FileTypeModule = await loadFileType();
  const rawMimeFromFile = await fileTypeFromFile(filePath);
  return rawMimeFromFile?.mime || null;
};

export const getMimeFromBuffer = async (buffer: Buffer) => {
  if (hasAsfSignature(buffer)) return null;
  const { fileTypeFromBuffer }: FileTypeModule = await loadFileType();
  const rawMimeFromFile = await fileTypeFromBuffer(buffer);
  return rawMimeFromFile?.mime || null;
};
