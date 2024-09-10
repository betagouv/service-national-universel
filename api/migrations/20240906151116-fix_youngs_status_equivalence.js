const { logger } = require("../src/logger");
const { YoungModel, MissionEquivalenceModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const youngs = await YoungModel.find({
      statusPhase1: { $in: ["DONE", "EXEMPTED"] },
      status_equivalence: { $in: ["WAITING_VERIFICATION", "WAITING_CORRECTION"] },
    }).select({ _id: 1 });
    logger.info(`Found ${youngs.length} youngs to update.`);
    const youngIds = youngs.map(({ _id }) => _id);
    const validatedEquivalences = await MissionEquivalenceModel.find({
      youngId: { $in: youngIds },
      status: "VALIDATED",
    });
    const validatedYoungIds = validatedEquivalences.map(({ youngId }) => youngId);
    await YoungModel.updateMany(
      {
        _id: { $in: validatedYoungIds },
      },
      {
        $set: { status_equivalence: "VALIDATED" },
      },
    );
  },
};
