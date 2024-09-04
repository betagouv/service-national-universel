import { isCohortTooOld, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";
import dayjs from "dayjs";

export function cohortAssignmentAnnouncementsIsOpenForYoung(cohort) {
  return cohort.isAssignmentAnnouncementsOpenForYoung === true;
}

export function getMeetingPointChoiceLimitDateForCohort(cohort) {
  return cohort.pdrChoiceLimitDate;
}

export function canChooseMeetingPointForCohort(cohortName) {
  const limitDate = getMeetingPointChoiceLimitDateForCohort(cohortName);
  return limitDate && dayjs().isBefore(limitDate);
}

// start of the cohort's last day
export function isCohortDone(cohort, extraDays = 0) {
  if (cohort && cohort.dateEnd) {
    const dateEnd = new Date(cohort.dateEnd);
    const endDateDayStart = new Date(dateEnd.getUTCFullYear(), dateEnd.getUTCMonth(), dateEnd.getUTCDate(), 0, 0, 0);
    endDateDayStart.setDate(dateEnd.getUTCDate() + extraDays);
    return endDateDayStart.valueOf() < Date.now();
  }
  return false;
}

// TODO: add this field in the cohort model.
export function isCohortNeedJdm(cohortName) {
  const needTheJDMPresenceTrue = ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Février 2022", "2021", "2022", "2020"];
  if (needTheJDMPresenceTrue.includes(cohortName)) {
    return true;
  } else {
    return false;
  }
}

export const canYoungResumePhase1 = (y) => {
  return (
    !isCohortTooOld(y) && y.status === YOUNG_STATUS.WITHDRAWN && ![YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED, YOUNG_STATUS_PHASE1.NOT_DONE].includes(y.statusPhase1)
  );
};
