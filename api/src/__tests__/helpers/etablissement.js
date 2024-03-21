const EtablissementObject = require("../../models/cle/etablissement");

async function getEtablissementHelper() {
  return await EtablissementObject.find({});
}

async function getEtablissementByIdHelper(etablissementId) {
  return await EtablissementObject.findById(etablissementId);
}

async function deleteEtablissementByIdHelper(etablissementId) {
  const young = await getEtablissementByIdHelper(etablissementId);
  if (young) await young.remove();
}

async function createEtablissementHelper(etablissement) {
  return await EtablissementObject.create(etablissement);
}

const notExistingEtablissementId = "104a49ba503040e4d2153000";

module.exports = {
  getEtablissementHelper,
  getEtablissementByIdHelper,
  deleteEtablissementByIdHelper,
  createEtablissementHelper,
  notExistingEtablissementId,
};
