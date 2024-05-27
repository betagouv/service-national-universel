import { COHORT_TYPE } from "snu-lib";

const CohortModel = require("../models/cohort");

const isInscriptionOpenOnSomeCohorts = async (): Promise<Boolean> => {
  const cohorts = await CohortModel.find({ type: COHORT_TYPE.VOLONTAIRE });
  return cohorts.some((cohort) => cohort.isInscriptionOpen);
};

const isReInscriptionOpenOnSomeCohorts = async (): Promise<Boolean> => {
  const cohorts = await CohortModel.find({ type: COHORT_TYPE.VOLONTAIRE });
  return cohorts.some((cohort) => cohort.isReInscriptionOpen);
};

export const isInscriptionOpen = async (): Promise<Boolean> => isInscriptionOpenOnSomeCohorts();
export const isReInscriptionOpen = async (): Promise<Boolean> => isReInscriptionOpenOnSomeCohorts();
