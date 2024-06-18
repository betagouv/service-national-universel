const EtablissementObject = require("../../models/cle/etablissement");

async function createEtablissement(etablissement) {
  const etablissementCreated = await EtablissementObject.create(etablissement);
  // Wait 100 ms to be sure that the center is created in the database
  await new Promise((resolve) => setTimeout(resolve, 100));
  return etablissementCreated;
}

module.exports = {
  createEtablissement,
};
