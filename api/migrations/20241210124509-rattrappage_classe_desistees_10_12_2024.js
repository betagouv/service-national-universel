const { logger } = require("../src/logger");
const { ClasseModel, YoungModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const classeIds = ["668ea356c269e600463e7a74", "668ea34fc269e600463e7841", "668ea2eec269e600463e5200"];

    const classes = await ClasseModel.find({ _id: { $in: classeIds } });

    logger.info(`Found ${classes.length} classes...`);

    for (const classe of classes) {
      const youngs = await YoungModel.find({ classeId: classe._id });
      logger.info(`Found ${youngs.length} youngs in class ${classe.name}...`);
      for (const young of youngs) {
        young.set({ status: "VALIDATED" });
        await young.save({ fromUser: { firstName: "rattrapage des jeunes CLE désistés" } });
      }
      if (classe._id.toString() === "674583ba3216d9ba70203208") {
        classe.set({ status: "OPEN" });
      } else {
        classe.set({ status: "CLOSED" });
      }
      await classe.save({ fromUser: { firstName: "rattrapage des classes désistés" } });
    }
  },

  async down(db, client) {
    const classeIds = ["668ea356c269e600463e7a74", "668ea34fc269e600463e7841", "668ea2eec269e600463e5200"];

    const classes = await ClasseModel.find({ _id: { $in: classeIds } });

    for (const classe of classes) {
      const youngs = await YoungModel.find({ classeId: classe._id });
      for (const young of youngs) {
        young.set({ status: "ABANDONED" });
        await young.save({ fromUser: { firstName: "rattrapage des jeunes CLE désistés" } });
      }
      classe.set({ status: "WITHDRAWN" });
      await classe.save({ fromUser: { firstName: "rattrapage des classes désistés" } });
    }
  },
};
