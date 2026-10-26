const { SessionPhase1Model } = require("../../models");
const mongoose = require("mongoose");

async function getCohesionCenterFromSession(sessionId) {
  const result = await SessionPhase1Model.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(sessionId) } },
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

module.exports = { getCohesionCenterFromSession };
