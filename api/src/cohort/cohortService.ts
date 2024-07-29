import { COHORT_TYPE } from "snu-lib";

const { CohortModel } = require("../models");

const isInscriptionOpenOnSomeCohorts = async (): Promise<Boolean> => {
  const cohorts = await CohortModel.find({ type: COHORT_TYPE.VOLONTAIRE });
  return cohorts.some((cohort) => cohort.isInscriptionOpen);
};

const isReInscriptionOpenOnSomeCohorts = async (): Promise<Boolean> => {
  const cohorts = await CohortModel.find({ type: COHORT_TYPE.VOLONTAIRE });
  return cohorts.some((cohort) => cohort.isReInscriptionOpen);
};

export const isInscriptionOpen = async (cohortName: String | undefined): Promise<Boolean> => {
  if (cohortName) {
    const cohort = await CohortModel.findOne({ name: cohortName });
    if (!cohort) return false;
    return cohort.isInscriptionOpen;
  }
  return isInscriptionOpenOnSomeCohorts();
};

export const isReInscriptionOpen = async (cohortName: String | undefined): Promise<Boolean> => {
  if (cohortName) {
    const cohort = await CohortModel.findOne({ name: cohortName });
    if (!cohort) return false;
    return cohort.isReInscriptionOpen;
  }
  return isReInscriptionOpenOnSomeCohorts();
};
