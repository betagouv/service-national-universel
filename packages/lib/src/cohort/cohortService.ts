import { ROLES } from "../roles";
import { CohortDto, ReferentDto, UserDto, ClasseDto } from "../dto";
import { isNowBetweenDates } from "../utils/date";
import { STATUS_CLASSE } from "../constants/constants";

export const canUpdateCohort = (cohort?: CohortDto, user?: UserDto | ReferentDto, classe?: ClasseDto): boolean => {
  if (!user) return false;
  if (!cohort) return user.role === ROLES.ADMIN && classe?.status === STATUS_CLASSE.VERIFIED;

  return (
    [ROLES.ADMIN].includes(user.role) ||
    (user?.role === ROLES.REFERENT_REGION &&
      !!cohort.cleUpdateCohortForReferentRegion &&
      isNowBetweenDates(cohort.cleUpdateCohortForReferentRegionDate?.from, cohort.cleUpdateCohortForReferentRegionDate?.to)) ||
    (user?.role === ROLES.REFERENT_DEPARTMENT &&
      !!cohort.cleUpdateCohortForReferentDepartment &&
      isNowBetweenDates(cohort.cleUpdateCohortForReferentDepartmentDate?.from, cohort.cleUpdateCohortForReferentDepartmentDate?.to))
  );
};

export const canUpdateCenter = (cohort: CohortDto | undefined, user: ReferentDto | undefined): boolean => {
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
