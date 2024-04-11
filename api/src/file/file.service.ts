import Zip from "adm-zip";

export type FileToZip = {
  name: string;
  buffer: Buffer;
};
export const buildZip = (files: FileToZip[]) => {
  const zip = new Zip();
  files.forEach((file) => {
    zip.addFile(file.name, file.buffer);
  });
  return zip.toBuffer();
};
