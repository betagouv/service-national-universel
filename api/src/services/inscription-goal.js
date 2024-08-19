const { InscriptionGoalModel } = require("../models");
const { YoungModel } = require("../models");

const getFillingRate = async (department, cohort) => {
  const youngCount = await YoungModel.find({ department, status: { $in: ["VALIDATED"] }, cohort }).countDocuments();
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department, cohort });
  if (!inscriptionGoal || !inscriptionGoal.max) {
    throw new Error("Objectifs de la région non accessibles ou inexistants");
  }
  const fillingRate = (youngCount || 0) / (inscriptionGoal?.max || 1);
  return fillingRate;
};

//@TODO: move to snu-lib and use it in the admin as well
const FILLING_RATE_LIMIT = 1;

module.exports = {
  getFillingRate,
  FILLING_RATE_LIMIT,
};
