import { getClasseLabelMap, getEtablissementLabelMap, getLigneLabelMap, getSessionLabelMap } from "./filterLabelRepository";

export const listTypes = { INSCRIPTION: "inscription-list", VOLONTAIRES: "young-list", VOLONTAIRES_CLE: "youngCle-list", LISTE_DIFFUSION: "liste-diffusion-filter" };

const labelMaps = {
  [listTypes.VOLONTAIRES]: [getSessionLabelMap, getLigneLabelMap, getClasseLabelMap, getEtablissementLabelMap],
  [listTypes.VOLONTAIRES_CLE]: [getSessionLabelMap, getLigneLabelMap, getClasseLabelMap],
  [listTypes.INSCRIPTION]: [getClasseLabelMap, getEtablissementLabelMap],
  [listTypes.LISTE_DIFFUSION]: [getSessionLabelMap, getLigneLabelMap, getClasseLabelMap, getEtablissementLabelMap],
};

export async function getLabels(listType: string): Promise<{ [key: string]: string }> {
  const labelMap = labelMaps[listType];
  if (!labelMap) throw new Error("Invalid list type");
  const labels = await Promise.all(labelMap.map((fn) => fn()));
  return labels.reduce((acc, curr) => ({ ...acc, ...curr }), {});
}
