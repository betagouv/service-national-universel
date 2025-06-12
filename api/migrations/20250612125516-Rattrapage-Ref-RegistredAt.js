const { ReferentModel } = require("../src/models");
const { logger } = require("../src/logger");
const { ROLES } = require("snu-lib");

module.exports = {
  async up() {
    const result = await ReferentModel.updateMany({ registredAt: { $exists: false }, role: { $in: [ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT] } }, [
      {
        $set: {
          registredAt: "$createdAt",
        },
      },
    ]);
    logger.info(`Rattrapage des référents sans registredAt: ${result.modifiedCount} référents mis à jour`);
  },
};
