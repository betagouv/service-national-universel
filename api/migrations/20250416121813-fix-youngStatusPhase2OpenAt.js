const { logger } = require("../src/logger");
const { YOUNG_STATUS_PHASE1, YOUNG_STATUS } = require("snu-lib");
const { YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const dateLimit = new Date("2025-03-26");
    const youngs = await YoungModel.updateMany(
      {
        cohesionStayPresence: { $ne: "true" },
        statusPhase2OpenedAt: { $gt: dateLimit },
      },
      { $set: { statusPhase2OpenedAt: undefined } },
    );

    logger.info(`${youngs.modifiedCount} youngs updated `);
  },
};
