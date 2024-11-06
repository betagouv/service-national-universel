import FileType from "file-type";

export const getMimeFromFile = async (filePath: string) => {
  const rawMimeFromFile = await FileType.fromFile(filePath);
  return rawMimeFromFile?.mime || null;
};

export const getMimeFromBuffer = async (buffer: Buffer) => {
  const rawMimeFromFile = await FileType.fromBuffer(buffer);
  return rawMimeFromFile?.mime || null;
};
