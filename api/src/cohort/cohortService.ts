import { COHORT_TYPE, ERRORS, CohortType, getZonedDate, YoungType, getDepartmentForEligibility, YOUNG_STATUS } from "snu-lib";
import { CohortDocument, CohortModel } from "../models";
import { buildCohortQuery } from "./cohortQueryBuilder";

const isInscriptionOpenOnSomeCohorts = async (): Promise<boolean> => {
  const cohorts = await CohortModel.find({ type: COHORT_TYPE.VOLONTAIRE });
  return cohorts.some((cohort) => cohort.isInscriptionOpen);
};

export const isInscriptionOpen = async (cohortName: string | undefined): Promise<boolean> => {
  if (cohortName) {
    const cohort = await CohortModel.findOne({ name: cohortName });
    if (!cohort) return false;
    return cohort.isInscriptionOpen;
  }
  return isInscriptionOpenOnSomeCohorts();
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
  const inscriptionStartDate = cohort.inscriptionStartDate;
  const inscriptionEndDate = cohort.inscriptionEndDate;
  const isInscriptionOpen = now >= inscriptionStartDate && now <= inscriptionEndDate;
  return isInscriptionOpen;
};

export const isCohortInscriptionClosed = (cohort: CohortType): boolean => {
  const now = getZonedDate(new Date(), "Europe/Paris");
  const inscriptionStartDate = new Date(cohort.inscriptionStartDate);
  const inscriptionEndDate = new Date(cohort.inscriptionEndDate);
  const isInscriptionClosed = now >= inscriptionEndDate || now <= inscriptionStartDate;
  return isInscriptionClosed;
};

function isCohortInscriptionOpenWithTimezone(cohort: CohortType, timeZoneOffset: unknown, status?: string) {
  // Les volontaires dont le dossier est en cours d'instruction peuvent encore changer de choix de séjour entre la clôture des inscriptions et celle de l'instruction.
  if (status && (status === YOUNG_STATUS.WAITING_CORRECTION || status === YOUNG_STATUS.WAITING_VALIDATION)) {
    return cohort.getIsInstructionOpen(Number(timeZoneOffset));
  }
  return cohort.getIsInscriptionOpen(Number(timeZoneOffset));
}

export async function getFilteredSessionsForChangementSejour(young: YoungType, timeZoneOffset?: string | number | null) {
  const currentCohort = await CohortModel.findById(young.cohortId);
  if (!currentCohort) throw new Error("Current cohort not found");
  if (!currentCohort.cohortGroupId) throw new Error("Current cohort group ID not found");

  const department = getDepartmentForEligibility(young);
  if (!department) throw new Error("Unable to determine department");

  const query = buildCohortQuery({
    birthdate: new Date(young.birthdateAt!),
    schoolLevel: young.grade!,
    department,
    cohortToExclude: young.cohortId,
    cohortGroupsToInclude: [currentCohort.cohortGroupId],
  });

  const cohorts = await CohortModel.find(query);
  return cohorts.filter((session) => isCohortInscriptionOpenWithTimezone(session, timeZoneOffset, young.status));
}
