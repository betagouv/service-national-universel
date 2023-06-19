import api from "../services/api";
import { capture } from "../sentry";
import { regionsListDROMS, sessions2023 } from "snu-lib";
import dayjs from "dayjs";
import { ALONE_ARRIVAL_HOUR, ALONE_DEPARTURE_HOUR } from "../scenes/phase1/scenes/affected/utils/steps.utils";
import { centersInJulyClosingEarly } from "snu-lib/plan-de-transport";
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
  if (meetingPoint?.departuredDate) return meetingPoint?.departuredDate;
  if (meetingPoint?.bus?.departuredDate) return meetingPoint?.bus?.departuredDate;
  return getGlobalDepartureDate(young);
}

/**
 * @param {object} young
 * @param {object} [meetingPoint]
 * @returns {date} the date of the return of the young to the meeting point if they have one,
 * or the default date for the cohort if they don't (local transport or traveling by own means).
 */
export function getReturnDate(young, meetingPoint = null) {
  if (meetingPoint?.returnDate) return meetingPoint?.returnDate;
  if (meetingPoint?.bus?.returnDate) return meetingPoint?.bus?.returnDate;
  return getGlobalReturnDate(young);
}

function getGlobalDepartureDate(young) {
  if (young.cohort === "Juillet 2023" && ![...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 5);
  }
  const cohortDetail = getCohort(young.cohort);
  return new Date(cohortDetail.dateStart);
}

function getGlobalReturnDate(young) {
  if (young.cohort === "Juillet 2023" && young.cohesionCenterId && centersInJulyClosingEarly.map((c) => c._id.$oid).includes(young.cohesionCenterId)) {
    return new Date(2021, 6, 16);
  }
  if (young.cohort === "Juillet 2023" && ![...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 17);
  }
  const cohortDetail = getCohort(young.cohort);
  return new Date(cohortDetail.dateEnd);
}

/**
 * @param {object} [meetingPoint]
 * @returns the hour of the departure of the young from the meeting point if they have one,
 * or a default hour if they don't (local transport or traveling by own means).
 */
export function getMeetingHour(meetingPoint = null) {
  if (meetingPoint?.meetingHour) return meetingPoint.meetingHour;
  if (meetingPoint?.ligneToPoint?.meetingHour) return meetingPoint.ligneToPoint.meetingHour;
  return ALONE_ARRIVAL_HOUR;
}

/**
 * @param {object} [meetingPoint]
 * @returns the hour of the return of the young to the meeting point if they have one,
 * or a default hour if they don't (local transport or traveling by own means).
 */
export function getReturnHour(meetingPoint = null) {
  if (meetingPoint?.returnHour) return meetingPoint.returnHour;
  if (meetingPoint?.ligneToPoint?.returnHour) return meetingPoint.ligneToPoint.returnHour;
  return ALONE_DEPARTURE_HOUR;
}

export const sessionDatesToString = (departureDate, returnDate) => {
  if (departureDate.getMonth() === returnDate.getMonth()) {
    return `du ${departureDate.getDate()} au ${returnDate.getDate()} ${departureDate.toLocaleString("fr", { month: "long", year: "numeric" })}`;
  }
  return `du ${departureDate.getDate()} ${departureDate.toLocaleString("fr", { month: "long" })} au ${returnDate.getDate()} ${returnDate.toLocaleString("fr", {
    month: "long",
    year: "numeric",
  })}`;
};
