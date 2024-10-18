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
      for (const young of youngs) {
        young.set({ inscriptionStep2023: "REPRESENTANTS" });
        await young.save({ fromUser: { firstName: "Migrations pour sortir les jeunes CLE de l'étape de CNI" } });
      }
    } catch (error) {
      logger.error("An error occurred during the migration up:", error);
    }
  },

  async down(db, client) {},
};
