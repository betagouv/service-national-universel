const { YOUNG_SOURCE, YOUNG_STATUS } = require("snu-lib");
const { YoungModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const youngs = await YoungModel.find({ status: { $ne: YOUNG_STATUS.DELETED }, source: YOUNG_SOURCE.VOLONTAIRE, classeId: { $exists: true } }).select({
      _id: 1,
      classeId: 1,
      cohort: 1,
      cohortId: 1,
    });
    console.log("Migration nettoyage bascule CLE vers HTS, found youngs", youngs.length);
    for (const young of youngs) {
      console.log("young", young._id.toString(), "classeId", young.classeId.toString(), "cohort", young.cohort.toString(), "cohortId", young.cohortId.toString());
      if (young.cohort.includes("CLE")) {
        console.warn("Cohort CLE avec young source VOLONTAIRE, skipping");
        continue;
      }
      young.classeId = null;
      await young.save({ fromUser: { firstName: "Nettoyage bascule CLE vers HTS" } });
    }
  },

  async down(db, client) {},
};
