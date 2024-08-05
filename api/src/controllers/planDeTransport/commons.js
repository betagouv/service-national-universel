const { SessionPhase1Model } = require("../../models");
const mongoose = require("mongoose");

const filteredRegionList = [
  "Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté",
  "Bretagne",
  "Centre-Val de Loire",
  "Corse",
  "Grand Est",
  "Hauts-de-France",
  "Île-de-France",
  "Normandie",
  "Nouvelle-Aquitaine",
  "Occitanie",
  "Pays de la Loire",
  "Provence-Alpes-Côte d'Azur",
  "Guadeloupe",
  "Martinique",
  "Guyane",
  "La Réunion",
  "Mayotte",
  "Polynésie française",
  "Nouvelle-Calédonie",
];

async function getCohesionCenterFromSession(sessionId) {
  const result = await SessionPhase1Model.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(sessionId) } },
    {
      $addFields: { centerId: { $toObjectId: "$cohesionCenterId" } },
    },
    {
      $lookup: {
        from: "cohesioncenters",
        localField: "centerId",
        foreignField: "_id",
        as: "center",
      },
    },
    { $unwind: "$center" },
    {
      $replaceRoot: { newRoot: "$center" },
    },
  ]);
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
}

module.exports = { filteredRegionList, getCohesionCenterFromSession };
