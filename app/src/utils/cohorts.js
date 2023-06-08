import api from "../services/api";
import { capture } from "../sentry";
import { YOUNG_STATUS_PHASE1, regionsListDROMS, sessions2023 } from "snu-lib";
import dayjs from "dayjs";
let cohorts = null;
let cohortsCachedAt = null;

export async function cohortsInit() {
  try {
    const result = await api.get("/cohort");
    if (!result.ok) {
      capture("Unable to load global cohorts data");
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

/**
 * @param {object} young
 * @param {object} [meetingPoint]
 * @returns {date} the date of the departure of the young from the meeting point if they have one,
 * or the default date for the cohort if they don't (local transport or traveling by own means).
 */
export function getDepartureDate(young, meetingPoint = null) {
  if (![YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE, YOUNG_STATUS_PHASE1.WITHDRAWN].includesyoung.statusPhase1) {
    throw new Error("Young is not affected");
  }
  if (meetingPoint?.departuredDate) {
    return meetingPoint?.departuredDate;
  }
  if (young.cohort === "Juillet 2023" && ![...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 5);
  }
  const cohortDetail = getCohort(young.cohort);
  return new Date(cohortDetail.dateStart);
}

/**
 * @param {object} young
 * @param {object} [meetingPoint]
 * @returns {date} the date of the return of the young from the meeting point if they have one,
 * or the default date for the cohort if they don't (local transport or traveling by own means).
 */
export function getReturnDate(young, meetingPoint = null) {
  if (meetingPoint?.returnDate) {
    return meetingPoint?.returnDate;
  }
  if (young.cohort === "Juillet 2023" && ![...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 17);
  }
  const cohortDetail = getCohort(young.cohort);
  return new Date(cohortDetail.dateEnd);
}
