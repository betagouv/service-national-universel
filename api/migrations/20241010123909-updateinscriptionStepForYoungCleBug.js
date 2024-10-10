const { logger } = require("../src/logger");
const { YoungModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    try {
      // Trouver les jeunes avec les critères spécifiques
      const youngs = await YoungModel.find({
        status: "IN_PROGRESS",
        source: "CLE",
        inscriptionStep2023: "DOCUMENTS",
      }).select({ _id: 1 });

      logger.info(`Found ${youngs.length} youngs to update.`);

      const youngIds = youngs.map(({ _id }) => _id);

      // Mettre à jour les jeunes trouvés pour changer leur `inscriptionStep2023` à "REPRESENTANTS"
      await YoungModel.updateMany(
        {
          _id: { $in: youngIds },
        },
        {
          $set: { inscriptionStep2023: "REPRESENTANTS" },
        },
      );

      logger.info(`Updated ${youngIds.length} youngs to "REPRESENTANTS"`);
    } catch (error) {
      logger.error("An error occurred during the migration up:", error);
    }
  },

  async down(db, client) {
    try {
      // Revenir à l'état initial, c'est-à-dire remettre les jeunes à "DOCUMENTS"
      const result = await YoungModel.updateMany(
        {
          status: "IN_PROGRESS",
          source: "CLE",
          inscriptionStep2023: "REPRESENTANTS",
        },
        {
          $set: { inscriptionStep2023: "DOCUMENTS" },
        },
      );

      logger.info(`Reverted ${result.nModified} youngs back to "DOCUMENTS"`);
    } catch (error) {
      logger.error("An error occurred during the migration down:", error);
    }
  },
};
