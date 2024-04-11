import { findYoungsByClasseId, generateConvocationsForMultipleYoungs } from "../young/young.service";
import { FUNCTIONAL_ERRORS } from "snu-lib/functionalErrors";
import { buildZip } from "../file/file.service";

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  if (youngsInClasse.length > 50) {
    throw new Error(FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE);
  }
  const youngsPdfs = await generateConvocationsForMultipleYoungs(youngsInClasse);

  return buildZip(
    youngsPdfs.map((youngPdf) => ({
      name: `${youngPdf.youngName}.pdf`,
      buffer: youngPdf.buffer,
    })),
  );
};
