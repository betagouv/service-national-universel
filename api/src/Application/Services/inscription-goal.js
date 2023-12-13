const InscriptionGoalModel = require("../../Infrastructure/Databases/Mongo/Models/inscriptionGoal");
const YoungModel = require("../../Infrastructure/Databases/Mongo/Models/young");

const getFillingRate = async (department, cohort) => {
  const youngCount = await YoungModel.find({ department, status: { $in: ["VALIDATED"] }, cohort }).countDocuments();
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department, cohort });
  const fillingRate = (youngCount || 0) / (inscriptionGoal.max || 1);
  return fillingRate;
};

//@TODO: move to snu-lib and use it in the admin as well
const FILLING_RATE_LIMIT = 1.05;

module.exports = {
  getFillingRate,
  FILLING_RATE_LIMIT,
};
