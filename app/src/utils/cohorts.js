import { YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

import api from "@/services/api";
import { capture } from "../sentry";
import dayjs from "dayjs";
let cohorts = null;
let cohortsCachedAt = null;

export async function cohortsInit() {
  if (isCohortsInitialized()) return;
  try {
    const result = await api.get("/cohort");
    if (result?.status === 401) {
      return;
    }
    if (!result?.ok) {
      capture("Unable to load global cohorts data :" + JSON.stringify(result));
    } else {
      cohorts = result.data;
      cohortsCachedAt = Date.now();
    }
  } catch (err) {
    capture(err);
  }
}

function isCohortsInitialized() {
  return cohortsCachedAt !== null && cohorts !== null && Array.isArray(cohorts);
}

export function getCohort(name) {
  if (isCohortsInitialized()) {
    return cohorts.find((c) => c.name === name) || name;
  } else {
    return undefined;
  }
}

export function cohortAssignmentAnnouncementsIsOpenForYoung(cohortName) {
  if (isCohortsInitialized()) {
    const cohort = getCohort(cohortName);
    if (cohort) {
      return cohort.isAssignmentAnnouncementsOpenForYoung === true;
    }
  }

  return false;
}

export function getMeetingPointChoiceLimitDateForCohort(cohortName) {
  const cohort = getCohort(cohortName);
  if (cohort && cohort.pdrChoiceLimitDate) {
    return cohort.pdrChoiceLimitDate;
  } else {
    return null;
  }
}

export function canChooseMeetingPointForCohort(cohortName) {
  const limitDate = getMeetingPointChoiceLimitDateForCohort(cohortName);
  return limitDate && dayjs().isBefore(limitDate);
}

// start of the cohort's last day
export function isCohortDone(cohortName, extraDays = 0) {
  if (["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022"].includes(cohortName)) return true;
  if (isCohortsInitialized()) {
    const cohort = getCohort(cohortName);
    if (cohort && cohort.dateEnd) {
      const dateEnd = new Date(cohort.dateEnd);
      const endDateDayStart = new Date(dateEnd.getUTCFullYear(), dateEnd.getUTCMonth(), dateEnd.getUTCDate(), 0, 0, 0);
      endDateDayStart.setDate(dateEnd.getUTCDate() + extraDays);
      return endDateDayStart.valueOf() < Date.now();
    }
    return false;
  }
  return false;
}

export function isCohortNeedJdm(cohortName) {
  const needTheJDMPresenceTrue = ["Février 2023 - C", "Avril 2023 - A", "Avril 2023 - B", "Février 2022", "2021", "2022", "2020"];
  if (needTheJDMPresenceTrue.includes(cohortName)) {
    return true;
  } else {
    return false;
  }
}

export const canYoungResumePhase1 = (y) => {
  if (!isCohortsInitialized()) throw new Error("cohorts not initialized");
  return (
    cohorts.map((e) => e.name).includes(y.cohort) &&
    y.status === YOUNG_STATUS.WITHDRAWN &&
    ![YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.EXEMPTED, YOUNG_STATUS_PHASE1.NOT_DONE].includes(y.statusPhase1)
  );
};
