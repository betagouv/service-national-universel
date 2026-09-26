import fs from "fs";

import FileType from "file-type";
import { hasAsfSignature } from "snu-lib";

// PM33 : un fichier ASF forgé fait boucler indéfiniment FileType.fromFile/fromBuffer (strtok3,
// file-type 16.5.4) — un timeout applicatif ne rendrait pas la main. On lit juste assez d'octets
// pour écarter la signature avant tout appel à FileType.
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
  const rawMimeFromFile = await FileType.fromFile(filePath);
  return rawMimeFromFile?.mime || null;
};

export const getMimeFromBuffer = async (buffer: Buffer) => {
  if (hasAsfSignature(buffer)) return null;
  const rawMimeFromFile = await FileType.fromBuffer(buffer);
  return rawMimeFromFile?.mime || null;
};
