const { CohortModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const cohorts = await CohortModel.find({});

    for (const cohort of cohorts) {
      if (!cohort.dateStart || !cohort.dateEnd) continue;
      const youngsBeforeSession = new Date(cohort.dateStart) + 2 * 24 * 60 * 60 * 1000;
      const youngsAfterSession = new Date(cohort.dateEnd) + 6 * 24 * 60 * 60 * 1000;
      cohort.injepExportDates = {
        youngsBeforeSession,
        youngsAfterSession,
      };
      await cohort.save({ fromUser: { firstName: "Migration ajout des dates d'export INJEP" } });
    }
  },

  async down(db, client) {
    const cohorts = await CohortModel.find({});

    for (const cohort of cohorts) {
      cohort.injepExportDates = undefined;
      await cohort.save({ fromUser: { firstName: "Migration suppression des dates d'export INJEP" } });
    }
  },
};
