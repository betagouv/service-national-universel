const { logger } = require("../src/logger");
const { YoungModel } = require("../src/models");
module.exports = {
  async up() {
    const youngs = await YoungModel.find({ situation: "" });
    logger.info(`Found ${youngs.length} youngs with empty situation...`);
    for (const young of youngs) {
      await YoungModel.updateOne({ _id: young._id }, { $unset: { situation: "" } });
    }
  },
};
