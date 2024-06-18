import { CleEtablissementModel } from "../../models";

async function createEtablissement(etablissement) {
  const etablissementCreated = await CleEtablissementModel.create(etablissement);
  return etablissementCreated;
}; 

export { createEtablissement };