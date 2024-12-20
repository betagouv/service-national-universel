const { STATUS_CLASSE } = require("snu-lib");
const { logger } = require("../src/logger");
const { ClasseModel } = require("../src/models");

module.exports = {
  async up() {
    const classeIds = ["668ea35fc269e600463e7da0"];

    const classes = await ClasseModel.find({ _id: { $in: classeIds } });

    logger.info(`Found ${classes.length} classes...`);

    for (const classe of classes) {
      classe.set({ status: STATUS_CLASSE.CLOSED });
      await classe.save({ fromUser: { firstName: "annulation des classes désistées 3804" } });
    }
  },

  async down() {
    const classeIds = ["668ea35fc269e600463e7da0"];

    const classes = await ClasseModel.find({ _id: { $in: classeIds } });

    for (const classe of classes) {
      classe.set({ status: STATUS_CLASSE.WITHDRAWN });
      await classe.save({ fromUser: { firstName: "annulation des classes désistées 3804" } });
    }
  },
};
