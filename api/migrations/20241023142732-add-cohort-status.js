const { COHORT_STATUS } = require("snu-lib");
const { CohortModel } = require("../src/models");

module.exports = {
  async up() {
    const archivedCohortNames = ["2019", "2020", "2021"];
    await CohortModel.updateMany({ name: { $in: archivedCohortNames } }, { $set: { status: COHORT_STATUS.ARCHIVED } });
    await CohortModel.updateMany({ name: { $nin: archivedCohortNames } }, { $set: { status: COHORT_STATUS.PUBLISHED } });
  },

  async down() {
    await CohortModel.updateMany({ status: COHORT_STATUS.ARCHIVED }, { $unset: { status: 1 } });
  },
};
