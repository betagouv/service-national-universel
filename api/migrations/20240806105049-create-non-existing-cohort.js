const { CohortModel } = require("../src/models");
const { logger } = require("../src/logger");
const cohortsNames = ["2019", "2020", "2021", "2022", "Juin 2022", "Février 2022", "Juin 2022", "Juillet 2022", "à venir"];
module.exports = {
  async up() {
    for (const cohortName of cohortsNames) {
      const cohort = new CohortModel({
        snuId: cohortName,
        name: cohortName,
        dateStart: new Date("2022-01-01"),
        dateEnd: new Date("2022-12-31"),
        eligibility: {
          zones: ["A"],
          schoolLevels: ["3eme"],
          bornAfter: new Date("2000-01-01"),
          bornBefore: new Date("2005-12-31"),
        },
        inscriptionStartDate: new Date("2022-02-01"),
        inscriptionEndDate: new Date("2022-03-31"),
        instructionEndDate: new Date("2022-04-30"),
        buffer: 1,
        event: "Event Name",
      });
      await cohort.save({ fromUser: { firstName: "create-non-existing-cohort" } });
    }
  },

  async down() {
    const deletedCohorts = await CohortModel.deleteMany({ name: { $in: cohortsNames } });
    logger.info(`Deleted Cohort: ${deletedCohorts.deletedCount}`);
  },
};
