const { CohortModel } = require("../models");

async function isPDRChoiceOpenForYoung(young) {
  const date = new Date();
  const cohort = await CohortModel.findOne({ name: young.cohort });
  if (!cohort) throw new Error("Cohort not found");
  return date < cohort.pdrChoiceLimitDate;
}

module.exports = {
  isPDRChoiceOpenForYoung,
};
