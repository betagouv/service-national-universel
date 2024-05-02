import { COHORT_TYPE } from "snu-lib";

const CohortModel = require("../../models/cohort");

const isInscriptionOpenOnSomeCohorts = async (): Promise<Boolean> => {
  const cohorts = await CohortModel.find({ type: COHORT_TYPE.VOLONTAIRE });
  return cohorts.some((cohort) => cohort.isInscriptionOpen);
};

export const isReInscriptionOpen = async (): Promise<Boolean> => isInscriptionOpenOnSomeCohorts();

export const isInscriptionOpen = async (cohortName: String | undefined): Promise<Boolean> => {
  if (cohortName) {
    const cohort = await CohortModel.findOne({ name: cohortName });
    if (!cohort) return false;
    return cohort.isInscriptionOpen();
  }
  return isInscriptionOpenOnSomeCohorts();
};
