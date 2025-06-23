const { logger } = require("../src/logger");
const { YOUNG_STATUS_PHASE1, YOUNG_STATUS } = require("snu-lib");
const { YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const filter = {
      cohesionCenterId: "659e70f6e3485608196927a6",
      sessionPhase1Id: "67ed294d1e4b7c03031d8104",
      status: YOUNG_STATUS.VALIDATED,
      statusPhase1: { $in: [YOUNG_STATUS_PHASE1.AFFECTED] },
    };

    const youngs = await YoungModel.find(filter);
    logger.info(`Migration 901-fermeture-centre: Found ${youngs.length} youngs to update`);

    let updatedCount = 0;
    for (const young of youngs) {
      young.statusPhase1 = YOUNG_STATUS_PHASE1.DONE;
      young.departSejourAt = new Date("2025-06-19");
      young.departSejourMotif = "Cas de force majeure pour le volontaire";
      young.departSejourMotifComment = "décision administrative de fermeture du centre";
      young.statusPhase2OpenedAt = new Date();

      await young.save({ fromUser: { firstName: "901-fermeture-centre" } });
      updatedCount++;
      logger.info(`Updated young ${young._id} (${updatedCount}/${youngs.length})`);
    }

    logger.info(`Migration 901-fermeture-centre: ${updatedCount} youngs updated with new statusPhase1 (${YOUNG_STATUS_PHASE1.DONE}) and departure information`);
  },

  async down() {
    const filter = {
      cohesionCenterId: "659e70f6e3485608196927a6",
      sessionPhase1Id: "67ed294d1e4b7c03031d8104",
      status: YOUNG_STATUS.VALIDATED,
      statusPhase1: { $in: [YOUNG_STATUS_PHASE1.DONE] },
      departSejourMotif: "Cas de force majeure pour le volontaire",
    };

    const youngs = await YoungModel.find(filter);
    logger.info(`Migration 901-fermeture-centre rollback: Found ${youngs.length} youngs to revert`);

    let revertedCount = 0;
    for (const young of youngs) {
      young.statusPhase1 = YOUNG_STATUS_PHASE1.AFFECTED;
      young.departSejourAt = undefined;
      young.departSejourMotif = undefined;
      young.departSejourMotifComment = undefined;

      await young.save({ fromUser: { firstName: "901-fermeture-centre-rollback" } });
      revertedCount++;
      logger.info(`Reverted young ${young._id} (${revertedCount}/${youngs.length})`);
    }

    logger.info(`Migration 901-fermeture-centre rollback: ${revertedCount} youngs reverted to ${YOUNG_STATUS_PHASE1.AFFECTED} status and departure info removed`);
  },
};
