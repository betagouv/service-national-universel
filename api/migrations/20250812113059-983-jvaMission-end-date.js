const { logger } = require("../src/logger");

module.exports = {
  async up() {
    logger.info("Running fix-missions-jva-endAt-2026");
    await require("../src/scripts/mission/FixMissionMissingEndAt").handler();
    logger.info("Done fix-missions-jva-endAt-2026");
  },

  async down() {},
};
