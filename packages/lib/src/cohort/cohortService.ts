import { ROLES } from "../roles";
import { CohortDto } from "../dto";
import { isNowBetweenDates } from "../utils/date";

export const canUpdateCohort = (cohort: CohortDto | undefined, user: ReferentRoleDto | undefined): boolean => {
  if (!user) return false;
  if (!cohort) return true;
  let canUpdateCohort = [ROLES.ADMIN].includes(user?.role);
  if (!canUpdateCohort && user?.role === ROLES.REFERENT_REGION) {
    canUpdateCohort =
      !!cohort.cleUpdateCohortForReferentRegion && isNowBetweenDates(cohort.cleUpdateCohortForReferentRegionDate?.from, cohort.cleUpdateCohortForReferentRegionDate?.to);
  }
  if (!canUpdateCohort && user?.role === ROLES.REFERENT_DEPARTMENT) {
    canUpdateCohort =
      !!cohort.cleUpdateCohortForReferentDepartment &&
      isNowBetweenDates(cohort.cleUpdateCohortForReferentDepartmentDate?.from, cohort.cleUpdateCohortForReferentDepartmentDate?.to);
  }
  return canUpdateCohort;
};

export const canUpdateCenter = (cohort: CohortDto | undefined, user: ReferentRoleDto | undefined): boolean => {
  if (!user) return false;
  if (!cohort) return true;
  let canUpdateCenter = [ROLES.ADMIN].includes(user?.role);
  if (!canUpdateCenter && user?.role === ROLES.REFERENT_REGION) {
    canUpdateCenter =
      !!cohort.cleUpdateCentersForReferentRegion && isNowBetweenDates(cohort.cleUpdateCentersForReferentRegionDate?.from, cohort.cleUpdateCentersForReferentRegionDate?.to);
  }
  if (!canUpdateCenter && user?.role === ROLES.REFERENT_DEPARTMENT) {
    canUpdateCenter =
      !!cohort.cleUpdateCentersForReferentDepartment &&
      isNowBetweenDates(cohort.cleUpdateCentersForReferentDepartmentDate?.from, cohort.cleUpdateCentersForReferentDepartmentDate?.to);
  }
  return canUpdateCenter;
};
