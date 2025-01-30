import { getClasseLabelMap, getEtablissementLabelMap, getLigneLabelMap, getSessionLabelMap } from "./filterLabelRepository";

export const listTypes = { INSCRIPTION: "inscription", VOLONTAIRES: "volontaires" };

export async function getLabelVolontaires() {
  const sessions = await getSessionLabelMap();
  const bus = await getLigneLabelMap();
  const classes = await getClasseLabelMap();
  const etablissements = await getEtablissementLabelMap();
  return { sessions, bus, classes, etablissements };
}
