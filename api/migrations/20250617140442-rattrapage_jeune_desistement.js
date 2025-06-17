const { YoungModel } = require("../src/models");
const { logger } = require("../src/logger");
module.exports = {
  async up() {
    const result = await YoungModel.updateMany(
      {
        withdrawnReason: "Non confirmation de la participation au séjour",
        $or: [{ withdrawnMessage: { $exists: false } }, { withdrawnMessage: "" }],
      },
      {
        $set: {
          withdrawnMessage: "Script de désistement en masse pour non confirmation de la participation",
        },
      },
    );
    logger.info(`Mise à jour des jeunes désistés : ${result.modifiedCount} jeunes ont été mis à jour.`);
  },
};
