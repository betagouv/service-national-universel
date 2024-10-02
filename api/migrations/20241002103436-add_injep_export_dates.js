const { CohortModel } = require("../src/models");
const dayjs = require("dayjs");

module.exports = {
  async up(db, client) {
    const cohorts = await CohortModel.find({});

    for (const cohort of cohorts) {
      if (!cohort.dateStart || !cohort.dateEnd) continue;
      const youngsBeforeSession = dayjs(cohort.dateStart).add(2, "day").toDate();
      const youngsAfterSession = dayjs(cohort.dateEnd).add(6, "day").toDate();
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
