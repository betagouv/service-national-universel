const { SessionPhase1Model, CohortModel } = require("../src/models");
const { logger } = require("../src/logger");

module.exports = {
  async up() {
    const sessionPhase1WithoutCohortName = await SessionPhase1Model.find({
      cohort: { $exists: false },
    });

    for (const session of sessionPhase1WithoutCohortName) {
      const cohort = await CohortModel.findById(session.cohortId);
      if (cohort) {
        session.set({ cohort: cohort.name });
        logger.info(`Updated session ${session._id} with cohort name ${cohort.name}`);
        await session.save({ fromUser: { firstName: "DENORMALIZE_COHORT_NAME_IN_SESSION" } });
      }
    }
    logger.info(`Updated sessionIds: ${sessionPhase1WithoutCohortName?.map((session) => session?._id)}`);
  },

  async down() {},
};
