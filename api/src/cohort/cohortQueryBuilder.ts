import { COHORT_STATUS } from "snu-lib";

type CohortArgs = {
  birthdate: Date;
  schoolLevel: string;
  department: string;
  cohortToExclude?: string;
  cohortGroupsToInclude?: string[];
  cohortGroupsToExclude?: string[];
};

type CohortQuery = {
  status: string;
  "eligibility.zones": string;
  "eligibility.schoolLevels": string;
  "eligibility.bornAfter": { $lte: Date };
  "eligibility.bornBefore": { $gte: Date };
  _id?: { $ne: string };
  cohortGroupId?: { $in: string[] } | { $nin: string[] };
};

export function buildCohortQuery({ birthdate, schoolLevel, department, cohortToExclude, cohortGroupsToInclude, cohortGroupsToExclude }: CohortArgs): CohortQuery {
  let query: CohortQuery = {
    status: COHORT_STATUS.PUBLISHED,
    "eligibility.zones": department,
    "eligibility.schoolLevels": schoolLevel,
    "eligibility.bornAfter": { $lte: birthdate },
    "eligibility.bornBefore": { $gte: new Date(birthdate.getTime() - 11 * 60 * 60 * 1000) },
  };
  if (cohortToExclude) query._id = { $ne: cohortToExclude };
  if (cohortGroupsToInclude) query.cohortGroupId = { $in: cohortGroupsToInclude };
  if (cohortGroupsToExclude) query.cohortGroupId = { ...query.cohortGroupId, $nin: cohortGroupsToExclude };
  return query;
}
