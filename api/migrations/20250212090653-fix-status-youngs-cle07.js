const { logger } = require("../src/logger");
const { YOUNG_STATUS_PHASE1, YOUNG_STATUS } = require("snu-lib");
const { YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const youngsInCohortCle07Mars2025Updated = await YoungModel.updateMany(
      { status: YOUNG_STATUS.VALIDATED, statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, cohort: "2025 CLE 07 - Mars" },
      { $set: { statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED } },
    );

    logger.info(
      `${youngsInCohortCle07Mars2025Updated.modifiedCount} youngs updated statusPhase1 with ${YOUNG_STATUS_PHASE1.WAITING_AFFECTATION} status set to ${YOUNG_STATUS_PHASE1.AFFECTED}`,
    );
  },
};
