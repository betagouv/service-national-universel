const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");

const getInscriptionGoalStats = async (department, cohort) => {
  const count = (await YoungModel.find({ department, status: { $in: ["VALIDATED"] }, cohort }).countDocuments()) || 0;
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department, cohort });
  if (!inscriptionGoal || !inscriptionGoal.max) {
    throw new Error("Objectifs de la région non accessibles ou inexistants");
  }
  const max = inscriptionGoal?.max || 1;
  return {
    count,
    max,
    fillingRate: count / max,
    rateLimit: FILLING_RATE_LIMIT,
  };
};

const getFillingRate = async (department, cohort) => {
  const { fillingRate } = await getInscriptionGoalStats(department, cohort);
  return fillingRate;
};

//@TODO: move to snu-lib and use it in the admin as well
const FILLING_RATE_LIMIT = 1;

module.exports = {
  getFillingRate,
  getInscriptionGoalStats,
  FILLING_RATE_LIMIT,
};
