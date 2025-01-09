const { STATUS_CLASSE, YOUNG_STATUS } = require("snu-lib");
const { logger } = require("../src/logger");
const { ClasseModel, YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const classeId = "668ea385c269e600463e8cc9";

    const classe = await ClasseModel.findById(classeId);
    logger.info(`Found ${classe.name}...`);
    classe.set({ status: STATUS_CLASSE.CLOSED });
    await classe.save({ fromUser: { firstName: "annulation des classes désistées 3804" } });

    const youngs = await YoungModel.find({ classeId: classe._id });
    logger.info(`Found ${youngs.length} youngs in class ${classe.name}...`);
    for (const young of youngs) {
      young.set({ status: YOUNG_STATUS.VALIDATED });
      await young.save({ fromUser: { firstName: "rattrapage des jeunes CLE désistés" } });
    }
  },

  async down() {
    const classeId = "668ea385c269e600463e8cc9";

    const classe = await ClasseModel.findById(classeId);
    logger.info(`Found ${classe.length} classes...`);
    classe.set({ status: STATUS_CLASSE.WITHDRAWN });
    await classe.save({ fromUser: { firstName: "annulation des classes désistées 3804" } });

    const youngs = await YoungModel.find({ classeId: classe._id });
    logger.info(`Found ${youngs.length} youngs in class ${classe.name}...`);
    for (const young of youngs) {
      young.set({ status: YOUNG_STATUS.ABANDONED });
      await young.save({ fromUser: { firstName: "rattrapage des jeunes CLE désistés" } });
    }
  },
};
