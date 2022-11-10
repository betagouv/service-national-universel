const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");

async function isGoalReached(department, cohort) {
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department: department, cohort: cohort });
  if (inscriptionGoal && inscriptionGoal.max) {
    const nbYoung = await YoungModel.countDocuments({
      department: department,
      cohort: cohort,
      status: { $nin: ["REFUSED", "NOT_ELIGIBLE", "WITHDRAWN", "DELETED"] },
    });
    if (nbYoung > 0) {
      const fillingRatio = nbYoung / Math.floor(inscriptionGoal.max * cohort.buffer);
      if (fillingRatio >= 1) return true;
    }
  }
  return false;
}

module.exports = {
  isGoalReached,
};
