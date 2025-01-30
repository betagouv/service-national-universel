import { getClasseLabel, getEtablissementLabel, getLigneLabel, getSessionLabel } from "./filterLabelRepository";

export const listTypes = { INSCRIPTION: "inscription", VOLONTAIRES: "volontaires" };

export async function getLabelVolontaires() {
  const sessions = await getSessionLabel();
  const bus = await getLigneLabel();
  const classes = await getClasseLabel();
  const etablissements = await getEtablissementLabel();
  return { sessions, bus, classes, etablissements };
}
