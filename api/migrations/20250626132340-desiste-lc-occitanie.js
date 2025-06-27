const { logger } = require("../src/logger");
const { YOUNG_STATUS } = require("snu-lib");
const { YoungModel } = require("../src/models");

const cohortName = "2025 HTS 04 - Juillet";
const reasonCode = "other";
const reasonMessage = "À votre demande, votre inscription n'est plus positionnée sur la liste d'attente du séjour de cohésion de juillet.";
const regions = ["Occitanie", "Nouvelle-Aquitaine"];

const fromUser = { firstName: `Désaffectation ${cohortName} ${regions.join(", ")}` };

module.exports = {
  async up() {
    const jeunes = await YoungModel.find({
      cohort: cohortName,
      region: { $in: regions },
      status: YOUNG_STATUS.WAITING_LIST,
    });
    logger.info(`Désaffectation ${cohortName}: ${jeunes.length} jeunes à desister`);
    for (const jeune of jeunes) {
      logger.info(`- désistement ${jeune.id} ${jeune.firstName} ${jeune.lastName}`);
      jeune.set({
        status: YOUNG_STATUS.WITHDRAWN,
        lastStatusAt: Date.now(),
        withdrawnReason: reasonCode,
        withdrawnMessage: reasonMessage,
      });
      await jeune.save({ fromUser });
    }
  },

  async down() {},
};
