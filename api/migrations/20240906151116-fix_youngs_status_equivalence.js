const { logger } = require("../src/logger");
const { YoungModel, MissionEquivalenceModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const youngs = await YoungModel.find({
      statusPhase1: { $in: ["DONE", "EXEMPTED"] },
      status_equivalence: { $in: ["WAITING_VERIFICATION", "WAITING_CORRECTION"] },
    });

    let modifiedYoungs = [];

    for (const young of youngs) {
      const validatedEquivalence = await MissionEquivalenceModel.findOne({
        youngId: young._id,
        status: "VALIDATED",
      });

      if (validatedEquivalence) {
        young.set("status_equivalence", "VALIDATED");
        await young.save();
        modifiedYoungs.push(young);
      }
    }
    if (modifiedYoungs.length > 0) {
      logger.info(`Updated ${modifiedYoungs.length} youngs status equivalence`);
      await db.collection("youngs_modified").insertMany(modifiedYoungs);
    }
  },
};
