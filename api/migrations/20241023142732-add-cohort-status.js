const { COHORT_STATUS } = require("snu-lib");
const { CohortModel } = require("../src/models");
const archivedCohortNames = ["2019", "2020", "2021"];

module.exports = {
  async up() {
    const cohortsToArchive = await CohortModel.find({ name: { $in: archivedCohortNames } });
    for (const cohort of cohortsToArchive) {
      cohort.set({ status: COHORT_STATUS.ARCHIVED });
      await cohort.save({ fromUser: { firstName: "Add status migration" } });
    }

    const cohortsToPublish = await CohortModel.find({ name: { $nin: archivedCohortNames } });
    for (const cohort of cohortsToPublish) {
      cohort.set({ status: COHORT_STATUS.PUBLISHED });
      await cohort.save({ fromUser: { firstName: "Add status migration" } });
    }
  },

  async down() {
    await CohortModel.updateMany({ status: COHORT_STATUS.ARCHIVED }, { $unset: { status: 1 } });
  },
};
