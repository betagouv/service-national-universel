import api from "../services/api";
import { capture } from "../sentry";
import { sessions2023 } from "snu-lib";
import dayjs from "dayjs";
let cohorts = null;
let cohortsCachedAt = null;

export async function cohortsInit() {
  try {
    const result = await api.get("/cohort");
    if (result.status === 401) {
      return;
    }
    if (!result.ok) {
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
    return cohorts.find((c) => c.name === name);
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

export function getCohortDetail(cohortName) {
  return sessions2023.find((c) => c.name === cohortName);
}

export function isCohortDone(cohortName) {
  if (["2019", "2020", "2021", "2022", "Février 2022", "Juin 2022", "Juillet 2022"].includes(cohortName)) return true;
  if (isCohortsInitialized()) {
    const cohort = getCohort(cohortName);
    if (cohort && cohort.dateEnd) {
      return cohort.dateEnd && new Date(cohort.dateEnd).valueOf() < Date.now();
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

export function getCohortPeriod(cohort) {
  const startDate = new Date(cohort.dateStart);
  const endDate = new Date(cohort.dateEnd);
  const endDateformatOptions = { year: "numeric", month: "long", day: "numeric" };
  const startDateformatOptions = { day: "numeric" };
  if (startDate.getMonth() !== endDate.getMonth()) {
    startDateformatOptions.month = "long";
  }
  if (startDate.getFullYear() !== endDate.getFullYear()) {
    startDateformatOptions.year = "numeric";
  }
  const formattedStart = new Intl.DateTimeFormat("fr-FR", startDateformatOptions).format(startDate);
  const formattedEnd = new Intl.DateTimeFormat("fr-FR", endDateformatOptions).format(endDate);

  return `du ${formattedStart} au ${formattedEnd}`;
}
