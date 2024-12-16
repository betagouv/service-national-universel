const { YOUNG_STATUS_LIST, YOUNG_STATUS } = require("snu-lib");
const { logger } = require("../src/logger");
const { ClasseModel, YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const classeIds = ["668ea399c269e600463e9418", "668ea358c269e600463e7b1d", "668ea399c269e600463e93e6"];

    const classes = await ClasseModel.find({ _id: { $in: classeIds } });

    logger.info(`Found ${classes.length} classes...`);

    for (const classe of classes) {
      const youngs = await YoungModel.find({ classeId: classe._id });
      logger.info(`Found ${youngs.length} youngs in class ${classe.name}...`);

      for (const young of youngs) {
        if (young._id.toString() === "6568cadd8bc29e0819b99b23") {
          young.set({ status: YOUNG_STATUS.WAITING_VALIDATION });
        } else if (young._id.toString() === "66fec3881df29182ef0bf297") {
          young.set({ status: YOUNG_STATUS.IN_PROGRESS });
        } else {
          young.set({ status: "VALIDATED" });
        }
        await young.save({ fromUser: { firstName: "rattrapage des jeunes CLE désistés" } });
      }

      classe.set({ status: "CLOSED" });

      await classe.save({ fromUser: { firstName: "annulation des classes désistées" } });
    }
  },

  async down() {
    const classeIds = ["668ea399c269e600463e9418", "668ea358c269e600463e7b1d", "668ea399c269e600463e93e6"];

    const classes = await ClasseModel.find({ _id: { $in: classeIds } });

    for (const classe of classes) {
      const youngs = await YoungModel.find({ classeId: classe._id });
      for (const young of youngs) {
        young.set({ status: "ABANDONED" });
        await young.save({ fromUser: { firstName: "rattrapage des jeunes CLE désistés" } });
      }
      classe.set({ status: "WITHDRAWN" });
      await classe.save({ fromUser: { firstName: "annulation des classes désistées" } });
    }
  },
};
