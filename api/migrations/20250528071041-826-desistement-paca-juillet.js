const { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } = require("snu-lib");
const { YoungModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const jeunes = await YoungModel.find({
      cohort: "2025 HTS 04 - Juillet",
      region: "Provence-Alpes-Côte d'Azur",
      status: YOUNG_STATUS.VALIDATED,
      statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
    });
    console.log(`Désaffectation HTS 04 PACA: ${jeunes.length} jeunes à desister`);
    for (const jeune of jeunes) {
      console.debug("- désistement", jeune.id, jeune.firstName, jeune.lastName);
      jeune.set({
        status: YOUNG_STATUS.WITHDRAWN,
        statusPhase1: YOUNG_STATUS_PHASE1.WAITING_AFFECTATION,
        lastStatusAt: Date.now(),
        withdrawnReason: "other",
        withdrawnMessage:
          "La région académique a été confrontée à un nombre insuffisant de prestataires à la suite de son appel d'offre d'organisation des séjours SNU : le nombre de places proposées en juillet ne permet pas d'accueillir tous les volontaires inscrits. Nous comprenons votre déception et vous prions de nous excuser pour cette situation.",
      });
      await jeune.save({ fromUser: { firstName: "Désaffectation HTS 04 PACA (826)" } });
    }
  },

  async down(db, client) {},
};
