import { ROLES } from "../roles";
import { CohortDto, ReferentRoleDto } from "../dto";
import { isNowBetweenDates } from "../utils/date";

export const canUpdateCohort = (cohort: CohortDto | undefined, user: ReferentRoleDto | undefined): boolean => {
  if (!user) return false;
  if (!cohort) return true;

  return (
    [ROLES.ADMIN].includes(user?.role) ||
    (user?.role === ROLES.REFERENT_REGION &&
      !!cohort.cleUpdateCohortForReferentRegion &&
      isNowBetweenDates(cohort.cleUpdateCohortForReferentRegionDate?.from, cohort.cleUpdateCohortForReferentRegionDate?.to)) ||
    (user?.role === ROLES.REFERENT_DEPARTMENT &&
      !!cohort.cleUpdateCohortForReferentDepartment &&
      isNowBetweenDates(cohort.cleUpdateCohortForReferentDepartmentDate?.from, cohort.cleUpdateCohortForReferentDepartmentDate?.to))
  );
};

export const canUpdateCenter = (cohort: CohortDto | undefined, user: ReferentRoleDto | undefined): boolean => {
  if (!user) return false;
  if (!cohort) return true;

  return (
    [ROLES.ADMIN].includes(user?.role) ||
    (user?.role === ROLES.REFERENT_REGION &&
      !!cohort.cleUpdateCentersForReferentRegion &&
      isNowBetweenDates(cohort.cleUpdateCentersForReferentRegionDate?.from, cohort.cleUpdateCentersForReferentRegionDate?.to)) ||
    (user?.role === ROLES.REFERENT_DEPARTMENT &&
      !!cohort.cleUpdateCentersForReferentDepartment &&
      isNowBetweenDates(cohort.cleUpdateCentersForReferentDepartmentDate?.from, cohort.cleUpdateCentersForReferentDepartmentDate?.to))
  );
};
