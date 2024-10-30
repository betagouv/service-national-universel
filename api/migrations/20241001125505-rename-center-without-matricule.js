const { CohesionCenterModel } = require("../src/models");
const { logger } = require("../src/logger");

const prefix = "DOUBLONS NE PAS UTILISER - ";

module.exports = {
  async up() {
    const cohesionCentersWithoutMatricule = await CohesionCenterModel.find({ matricule: { $exists: false } });
    const cohesionCenterIdsNameUpdated = [];
    for (const cohesionCenter of cohesionCentersWithoutMatricule) {
      const name = cohesionCenter.name;
      if (!name.startsWith(prefix)) {
        cohesionCenter.name = prefix + name;
        logger.info(`Renaming cohesion center : ${cohesionCenter._id} - ${name} to ${cohesionCenter.name}`);
        await cohesionCenter.save({ fromUser: { firstName: "RENAME_COHESION_CENTER_WITHOUT_MATRICULE" } });
        cohesionCenterIdsNameUpdated.push(cohesionCenter._id);
      } else {
        logger.info(`Cohesion center already renamed : ${cohesionCenter._id} - ${name}`);
      }
    }
    logger.info(`Updated name of cohesionCenterIds: ${cohesionCenterIdsNameUpdated}`);
  },

  async down() {
    const cohesionCentersWithoutMatricule = await CohesionCenterModel.find({ matricule: { $exists: false } });
    const cohesionCenterIdsNameUpdated = [];

    for (const cohesionCenter of cohesionCentersWithoutMatricule) {
      const name = cohesionCenter.name;
      if (name.startsWith(prefix)) {
        cohesionCenter.name = name.replace(prefix, "");
        logger.info(`Renaming cohesion center : ${cohesionCenter._id} - ${name} to ${cohesionCenter.name}`);
        await cohesionCenter.save({ fromUser: { firstName: "RENAME_COHESION_CENTER_WITHOUT_MATRICULE" } });
        cohesionCenterIdsNameUpdated.push(cohesionCenter._id);
      } else {
        logger.info(`Cohesion center name does not start by ${prefix} : ${cohesionCenter._id} - ${name}`);
      }
    }

    logger.info(`Updated name of cohesionCenterIds: ${cohesionCenterIdsNameUpdated}`);
  },
};
