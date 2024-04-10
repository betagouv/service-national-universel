import * as youngService from "../young/young.service";
import Zip from "adm-zip";

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await youngService.findYoungsByClasseId(classeId);

  if (youngsInClasse.length > 50) {
    throw new Error("TOO_MANY_YOUNGS_IN_CLASSE");
  }
  const youngsPdfs = await youngService.generateConvocationsForMultipleYoungs(youngsInClasse);

  let zip = new Zip();
  youngsPdfs.forEach((youngPdf) => {
    zip.addFile(`${youngPdf.youngName}.pdf`, youngPdf.buffer);
  });
  return zip.toBuffer();
};
