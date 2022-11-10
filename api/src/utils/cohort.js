const { YOUNG_STATUS } = require("snu-lib");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");

async function isGoalReached(department, cohort) {
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department: department, cohort: cohort });
  if (inscriptionGoal && inscriptionGoal.max) {
    const nbYoung = await YoungModel.countDocuments({
      department: department,
      cohort: cohort,
      status: { $nin: [YOUNG_STATUS.DELETED, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.NOT_ELIGIBLE, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN] },
    });
    if (nbYoung > 0) {
      const fillingRatio = nbYoung / Math.floor(inscriptionGoal.max * cohort.buffer);
      if (fillingRatio >= 1) return true;
    }
  }
  return false;
}

async function isSessionFull(department, cohort) {
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department: department, cohort: cohort });
  if (inscriptionGoal && inscriptionGoal.max) {
    const placesTaken = await YoungModel.countDocuments({
      $or: [{ schoolDepartment: department }, { schoolDepartment: { $exists: false }, department: department }],
      cohort: cohort,
      status: YOUNG_STATUS.VALIDATED,
    });
    if (placesTaken && placesTaken >= inscriptionGoal.max) return true;
  }
  return false;
}

module.exports = {
  isGoalReached,
  isSessionFull,
};
