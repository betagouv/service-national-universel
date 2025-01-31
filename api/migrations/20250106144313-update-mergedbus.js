const { logger } = require("../src/logger");
const { LigneBusModel } = require("../src/models");
const { getMergedBusIdsFromLigneBus } = require("../src/planDeTransport/planDeTransport/import/pdtImportUtils");

module.exports = {
  async up() {
    // ligne de bus avec des lignes fusionnées
    const ligneBusList = await LigneBusModel.find({ mergedBusIds: { $exists: true, $ne: [] } });
    logger.info(`Found ${ligneBusList.length} bus...`);

    // groupBy cohort
    const ligneBusByCohort = ligneBusList.reduce((acc, ligneDeBus) => {
      acc[ligneDeBus.cohort] = acc[ligneDeBus.cohort] ? [...acc[ligneDeBus.cohort], ligneDeBus] : [ligneDeBus];
      return acc;
    }, {});

    logger.info(`Found ${Object.keys(ligneBusByCohort).length} cohorts...`);

    for (const cohort of Object.keys(ligneBusByCohort)) {
      // pour chaque cohorte (PDT), on calcul les mergedBusIds complet
      const existingMergedBusIds = getMergedBusIdsFromLigneBus(ligneBusByCohort[cohort]);

      for (const ligneDeBus of ligneBusByCohort[cohort]) {
        const newMergedBusIds = existingMergedBusIds[ligneDeBus.busId];
        if (newMergedBusIds) {
          console.log("Updating", ligneDeBus._id.toString(), ligneDeBus.busId, newMergedBusIds, ligneDeBus.cohort);
          ligneDeBus.set({ mergedBusIds: newMergedBusIds });
          await ligneDeBus.save({ fromUser: { firstName: "migration ligne fusionnée" } });
        } else {
          console.log("No update for", ligneDeBus._id.toString(), ligneDeBus.busId);
        }
      }
    }
  },

  async down() {},
};
