const { logger } = require("../src/logger");
const { LigneBusModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const lignesIncoherentes = await LigneBusModel.aggregate([
      {
        $addFields: {
          convertedId: {
            $toString: "$_id",
          },
        },
      },
      {
        $lookup: {
          as: "etapesByLigne",
          from: "lignetopoints",
          foreignField: "lineId",
          localField: "convertedId",
        },
      },
      {
        $addFields: {
          nbEtapes: { $size: "$etapesByLigne" },
          nbPdrs: { $size: "$meetingPointsIds" },
          id: "$convertedId",
        },
      },
      {
        $match: {
          nbEtapes: { $gt: 1 },
          nbPdrs: 1,
        },
      },
      {
        $project: {
          id: 1,
          nbPdrs: 1,
          nbEtapes: 1,
          meetingPointsIds: 1,
          etapesByLigne: 1,
        },
      },
    ]);
    for (const ligneIncoherente of lignesIncoherentes) {
      const pdrsEtapes = ligneIncoherente.etapesByLigne.map((etape) => etape.meetingPointId);
      if (ligneIncoherente.nbEtapes > ligneIncoherente.nbPdrs) {
        logger.info(`Ligne ${ligneIncoherente.id} modifications pdrs ${ligneIncoherente.meetingPointsIds} => ${pdrsEtapes}`);
        await LigneBusModel.updateOne({ _id: ligneIncoherente.id }, { $set: { meetingPointsIds: pdrsEtapes } }, { fromUser: { firstName: "Corrections PDRs", lastName: "" } });
      } else {
        logger.info(`Ligne ${ligneIncoherente.id} n'a pas plus d'étapes que de pdrs ${ligneIncoherente.meetingPointsIds} ${ligneIncoherente.nbPdrs}`);
      }
    }
  },

  async down(db, client) {},
};
