const { CohesionCenterModel, SessionPhase1Model, YoungModel } = require("../src/models");
const { logger } = require("../src/logger");

module.exports = {
  async up() {
    const cohesionCentersToDelete = await CohesionCenterModel.findById("66f3ec1de56e019e47320326");
    const youngsInCohesionCenter = await YoungModel.find({ cohesionCenterId: cohesionCentersToDelete._id });
    logger.info(`Number of youngs in cohesion centers to delete: ${youngsInCohesionCenter.length}`);

    const sessionsInCohesionCenter = await SessionPhase1Model.find({ cohesionCenterId: cohesionCentersToDelete._id });
    logger.info(`Number of sessions in cohesion centers to delete: ${sessionsInCohesionCenter.length}`);
    if (youngsInCohesionCenter.length === 0 && sessionsInCohesionCenter.length === 0) {
      return;
    }

    if (sessionsInCohesionCenter.length > 0) {
      for (const session of sessionsInCohesionCenter) {
        logger.info(`Session ${session._id} in cohestion center :${cohesionCentersToDelete._id} `);
        const youngsBySessionPhase1 = await YoungModel.find({ sessionPhase1Id: session._id });
        if (youngsBySessionPhase1.length > 0) {
          logger.warn(`Number of youngs in sessions found: ${youngsBySessionPhase1.length}`);
          logger.warn(`Youngs in sessions found: ${youngsBySessionPhase1.map((young) => young._id)}`);
        }
      }
    }

    if (youngsInCohesionCenter.length > 0) {
      // Update youngs
      const newCohesionCenterId = "66faa39577e26f1ed3183fef";
      for (const young of youngsInCohesionCenter) {
        logger.info(`Updating young ${young._id} to cohestion center : ${newCohesionCenterId}`);
        young.set({ cohesionCenterId: newCohesionCenterId });
        await young.save({ fromUser: "Suppression des doublons centres de cohesion" });
      }
    }

    cohesionCentersToDelete.set({ deletedAt: new Date() });
    await cohesionCentersToDelete.save({ fromUser: "Suppression des doublons centres de cohesion" });
  },

  async down() {
    const cohesionCenter = await CohesionCenterModel.findById("66f3ec1de56e019e47320326");
    if (!cohesionCenter) {
      logger.error("Cohesion center not found");
      return;
    }

    // Restore the deleted cohesion center
    cohesionCenter.set({ deletedAt: null });
    await cohesionCenter.save({ fromUser: "Rollback - Suppression des doublons centres de cohesion" });

    // Find all youngs that were moved to the new center
    const youngs = await YoungModel.find({ cohesionCenterId: "66faa39577e26f1ed3183fef" });

    // Move them back to the original center
    for (const young of youngs) {
      logger.info(`Rolling back young ${young._id} to original cohesion center: ${cohesionCenter._id}`);
      young.set({ cohesionCenterId: cohesionCenter._id });
      await young.save({ fromUser: "Rollback - Suppression des doublons centres de cohesion" });
    }
  },
};
