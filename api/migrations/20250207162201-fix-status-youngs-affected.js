const { logger } = require("../src/logger");
const { YOUNG_STATUS_PHASE1, YOUNG_STATUS } = require("snu-lib");
const { YoungModel } = require("../src/models");

const youngsInCohortCle2025WithAffectedStatusRegex = /^2025\s+CLE\s+(?!0[1-6]\b)/;

module.exports = {
  async up() {
    const youngsInCohortCle2025WithAffectedStatusUpdated = await YoungModel.updateMany(
      { status: YOUNG_STATUS.AFFECTED, statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED, cohort: { $regex: youngsInCohortCle2025WithAffectedStatusRegex } },
      { $set: { statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION } },
    );

    logger.info(
      `${youngsInCohortCle2025WithAffectedStatusUpdated.modifiedCount} youngs updated statusPhase1 with ${YOUNG_STATUS_PHASE1.AFFECTED} status set to ${YOUNG_STATUS_PHASE1.WAITING_AFFECTATION}`,
    );
  },
  async down() {
    const youngsInCohortCle2025WithAffectedStatusUpdated = await YoungModel.updateMany(
      { status: YOUNG_STATUS.AFFECTED, statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION, cohort: { $regex: youngsInCohortCle2025WithAffectedStatusRegex } },
      { $set: { statusPhase1: YOUNG_STATUS_PHASE1.AFFECTED } },
    );

    logger.info(
      `${youngsInCohortCle2025WithAffectedStatusUpdated.modifiedCount} youngs updated statusPhase1 with ${YOUNG_STATUS_PHASE1.WAITING_AFFECTATION} status set to ${YOUNG_STATUS_PHASE1.AFFECTED}`,
    );
  },
};
