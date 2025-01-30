import { getBus, getClasses, getEtablissements, getSessions } from "./filterLabelRepository";

export const listTypes = { INSCRIPTION: "inscription", VOLONTAIRES: "volontaires" };

export async function getLabelVolontaires() {
  const sessions = await getSessions();
  const bus = await getBus();
  const classes = await getClasses();
  const etablissements = await getEtablissements();
  return { sessions, bus, classes, etablissements };
}
