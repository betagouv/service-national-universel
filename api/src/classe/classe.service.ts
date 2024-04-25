import { findYoungsByClasseId, generateConvocationsForMultipleYoungs } from "../young/young.service";

// Import via commonjs to allow jest testing
const { FUNCTIONAL_ERRORS } = require("snu-lib");

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  if (youngsInClasse.length > 50) {
    throw new Error(FUNCTIONAL_ERRORS.TOO_MANY_YOUNGS_IN_CLASSE);
  }
  return await generateConvocationsForMultipleYoungs(youngsInClasse);
};
