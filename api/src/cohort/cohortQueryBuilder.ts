import { COHORT_STATUS } from "snu-lib";

type CohortArgs = {
  birthdate: Date;
  schoolLevel: string;
  department: string;
  cohortToExclude?: string;
  cohortGroupToInclude?: string;
  cohortGroupsToExclude?: string[];
};

type CohortQuery = {
  status: string;
  "eligibility.zones": string;
  "eligibility.schoolLevels": string;
  "eligibility.bornAfter": { $lte: Date };
  "eligibility.bornBefore": { $gte: Date };
  _id?: { $ne: string };
  cohortGroupId?: string | { $nin: string[] };
};

export function buildCohortQuery({ birthdate, schoolLevel, department, cohortToExclude, cohortGroupToInclude, cohortGroupsToExclude }: CohortArgs): CohortQuery {
  let query: CohortQuery = {
    status: COHORT_STATUS.PUBLISHED,
    "eligibility.zones": department,
    "eligibility.schoolLevels": schoolLevel,
    "eligibility.bornAfter": { $lte: birthdate },
    "eligibility.bornBefore": { $gte: new Date(birthdate.getTime() - 11 * 60 * 60 * 1000) },
  };
  if (cohortToExclude) query._id = { $ne: cohortToExclude };
  if (cohortGroupToInclude) query.cohortGroupId = cohortGroupToInclude;
  if (cohortGroupsToExclude) query.cohortGroupId = { $nin: cohortGroupsToExclude };
  return query;
}
