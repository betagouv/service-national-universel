import { FUNCTIONAL_ERRORS } from "snu-lib";
import { InscriptionGoalModel, YoungModel } from "../models";

export const getFillingRate = async (department, cohort) => {
  const youngCount = await YoungModel.find({ department, status: { $in: ["VALIDATED"] }, cohort }).countDocuments();
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department, cohort });
  if (!inscriptionGoal || !inscriptionGoal.max) {
    throw new Error(FUNCTIONAL_ERRORS.INSCRIPTION_GOAL_NOT_DEFINED);
  }
  const fillingRate = (youngCount || 0) / (inscriptionGoal?.max || 1);
  return fillingRate;
};

export const getInscriptionGoalStats = async (department, cohort) => {
  const count = (await YoungModel.find({ department, status: { $in: ["VALIDATED"] }, cohort }).countDocuments()) || 0;
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department, cohort });
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
