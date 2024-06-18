const mongoose = require("mongoose");

function createFixtureEtablissement(fields = {}) {
  const etablissement = {
    referentEtablissementIds: [new mongoose.Types.ObjectId().toString()],
    coordinateurIds: [new mongoose.Types.ObjectId().toString()],
    type: ["Lycée Général et Technologique"],
    sector: ["Statut public"],
    schoolId: new mongoose.Types.ObjectId().toString(),
    uai: "0352992M",
    name: "Antenne CFA EN Jean-Jaurès Rennes",
    address: "56 Rue du Général Leclerc",
    department: "Sarthe",
    region: "Pays de la Loire",
    zip: "72300",
    city: "Sablé-sur-Sarthe",
    country: "France",
    academy: "Limoges",
    schoolYears: ["2023-2024"],
    state: "inactive",
    ...fields,
  };
  return etablissement;
}
module.exports = {
  createFixtureEtablissement,
};
