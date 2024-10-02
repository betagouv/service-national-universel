const { ClasseModel, YoungModel } = require("../src/models");
const { logger } = require("../src/logger");

module.exports = {
  async up(db, client) {
    const youngUpdated = [];
    const classes = await ClasseModel.find({ schoolYear: "2024-2025" });
    logger.info(`Found ${classes.length} classes for schoolYear 2024-2025`);
    for (const classe of classes) {
      const youngs = await YoungModel.find({ classeId: classe._id });
      for (const young of youngs) {
        if (young.cohortId !== classe.cohortId) {
          young.set({ cohortId: classe.cohortId, cohort: classe.cohort });
          await young.save({ fromUser: { firstName: "Rattrappage CLE des young avec une cohorte différente de sa classe" } });
          youngUpdated.push(young._id);
          logger.info(`Young ${young._id} updated with cohortId ${classe.cohortId} and cohort ${classe.cohort}`);
        }
      }
    }
    logger.info(`Updated cohort of youngs: ${youngUpdated}`);
    logger.info(`${youngUpdated.length} youngs updated`);
  },
};
