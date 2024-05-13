import { findYoungsByClasseId, generateConvocationsForMultipleYoungs } from "../young/young.service";

export const generateConvocationsByClasseId = async (classeId: string) => {
  const youngsInClasse = await findYoungsByClasseId(classeId);

  return await generateConvocationsForMultipleYoungs(youngsInClasse);
};
