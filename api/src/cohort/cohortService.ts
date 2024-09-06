import { COHORT_TYPE, ERRORS } from "snu-lib";
import { CohortDocument, CohortType } from "../models";

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

export const findCohortBySnuIdOrThrow = async (cohortName: string) => {
  const cohort = await CohortModel.findOne({ snuId: cohortName });
  if (!cohort) {
    throw new Error(ERRORS.COHORT_NOT_FOUND);
  }
  return cohort;
};

export const getCohortIdsFromCohortName = async (cohortNames: string[]): Promise<string[]> => {
  const cohorts: Pick<CohortDocument, "_id" | "name">[] = await CohortModel.find({ name: { $in: cohortNames } }, { _id: 1, name: 1 }).lean();
  return cohorts.map((cohort) => cohort._id);
};

export const isCohortInscriptionOpen = (cohort: CohortType): boolean => {
  const now = new Date();
  const inscriptionStartDate = new Date(cohort.inscriptionStartDate);
  const inscriptionEndDate = new Date(cohort.inscriptionEndDate);
  const isInscriptionOpen = now >= inscriptionStartDate && now <= inscriptionEndDate;
  return isInscriptionOpen;
};

export const isCohortInscriptionClosed = (cohort: CohortType): boolean => {
  const now = new Date();
  const inscriptionStartDate = new Date(cohort.inscriptionStartDate);
  const inscriptionEndDate = new Date(cohort.inscriptionEndDate);
  const isInscriptionClosed = now >= inscriptionEndDate || now <= inscriptionStartDate;
  return isInscriptionClosed;
};
