import { EtablissementModel } from "../../models";

async function createEtablissement(etablissement) {
  const etablissementCreated = await EtablissementModel.create(etablissement);
  return etablissementCreated;
}

export { createEtablissement };
