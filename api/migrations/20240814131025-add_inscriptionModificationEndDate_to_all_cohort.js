const { CohortModel } = require("../src/models");

module.exports = {
  async up() {
    const cohorts = await CohortModel.find({
      inscriptionModificationEndDate: { $exists: false },
    });

    for (const cohort of cohorts) {
      cohort.inscriptionModificationEndDate = cohort.inscriptionEndDate;
      await cohort.save();
    }
  },
};
