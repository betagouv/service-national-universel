const { ClasseModel, YoungModel } = require("../src/models");
const { logger } = require("../src/logger");

module.exports = {
  async up() {
    const youngUpdated = [];
    const classes = await ClasseModel.find({ schoolYear: "2024-2025" });
    logger.info(`Found ${classes.length} classes for schoolYear 2024-2025`);
    for (const classe of classes) {
      const youngs = await YoungModel.find({ classeId: classe._id });
      for (const young of youngs) {
        if (young.cohortId !== classe.cohortId) {
          const originalCohortId = young.cohortId;
          const originalCohortName = young.cohort;
          young.set({
            cohortId: classe.cohortId,
            cohort: classe.cohort,
            originalCohort: originalCohortName,
            originalCohortId: originalCohortId,
            cohortChangeReason: `Import SI-SNU`,
          });
          await young.save({ fromUser: { firstName: "Rattrapage des jeunes CLE dont la cohorte est différente de la classe" } });
          youngUpdated.push(young._id);
          logger.info(`Young ${young._id} updated with cohortId ${classe.cohortId} and cohort ${classe.cohort}`);
        }
      }
    }
    logger.info(`Updated cohort of youngs: ${youngUpdated}`);
    logger.info(`${youngUpdated.length} youngs updated`);
  },
};
