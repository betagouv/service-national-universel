import { FUNCTIONAL_ERRORS } from "snu-lib";
import { InscriptionGoalModel, YoungModel } from "../models";

// cf: api/src/crons/computeGoalsInscription.js getCount
const getJeunesValidesCount = async (department, cohort) => {
  const jeunesScolariseCount = await YoungModel.find({ department, schoolDepartment: department, status: { $in: ["VALIDATED"] }, cohort }).countDocuments();
  const jeunesNonscolariseCount = await YoungModel.find({ department, schoolDepartment: { $exists: false }, status: { $in: ["VALIDATED"] }, cohort }).countDocuments();
  const jeunesHzrCount = await YoungModel.find({ departement: { $ne: department }, schoolDepartment: department, status: { $in: ["VALIDATED"] }, cohort }).countDocuments();

  return jeunesScolariseCount + jeunesHzrCount + jeunesNonscolariseCount;
};

export const getFillingRate = async (department, cohort) => {
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department, cohort });
  if (!inscriptionGoal || !inscriptionGoal.max) {
    throw new Error(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
  }
  const youngGlobalCount = await getJeunesValidesCount(department, cohort);

  const fillingRate = (youngGlobalCount || 0) / (inscriptionGoal?.max || 1);
  return fillingRate;
};

export const getInscriptionGoalStats = async (department, cohort) => {
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department, cohort });
  const count = (await getJeunesValidesCount(department, cohort)) || 0;
  const max = inscriptionGoal?.max || 1;
  return {
    count,
    max,
    fillingRate: count / max,
    rateLimit: FILLING_RATE_LIMIT,
  };
};

//@TODO: move to snu-lib and use it in the admin as well
export const FILLING_RATE_LIMIT = 1;
