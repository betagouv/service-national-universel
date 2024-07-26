import { YOUNG_STATUS_PHASE1 } from "./constants/constants";
import { regionsListDROMS } from "./region-and-departments";

const TRANSPORT_TIMES = {
  ALONE_ARRIVAL_HOUR: "16:00",
  ALONE_DEPARTURE_HOUR: "11:00",
};

/**
 * @param {Object} young
 * @param {Object} session
 * @param {Object} cohort
 * @param {Object} [meetingPoint]
 * @returns {date} the date of departure to the cohesion center from the following resource:
 * 1. The meeting point if they have one (young has a transport line)
 * 2. If not, the session if it has a specific date
 * 3. If not, the default date for the cohort.
 */
function getDepartureDate(young, session, cohort, meetingPoint: any = null) {
  if (meetingPoint?.bus || meetingPoint?.ligneBus || meetingPoint?.departuredDate) return getMeetingPointDepartureDate(meetingPoint);
  if (young?.status && young.status !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) return getCenterArrivalDate(young, session, cohort);
  return getGlobalDepartureDate(young, cohort);
}

function getMeetingPointDepartureDate(meetingPoint) {
  if (meetingPoint?.bus?.departuredDate) return new Date(meetingPoint?.bus?.departuredDate);
  if (meetingPoint?.ligneBus?.departuredDate) return new Date(meetingPoint?.ligneBus?.departuredDate);
  return new Date(meetingPoint?.departuredDate);
}

function getCenterArrivalDate(young, session, cohort) {
  if (session?.dateStart) return new Date(session?.dateStart);
  return getGlobalDepartureDate(young, cohort);
}

function getGlobalDepartureDate(young, cohort) {
  if (young.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 4);
  }
  if (cohort?.dateStart) return new Date(cohort.dateStart);
  return new Date();
}

/**
 * @param {Object} young
 * @param {object} session
 * @param {object} cohort
 * @param {object} [meetingPoint]
 * @returns {date} the date of departure from the cohesion center from the following resource:
 * 1. The meeting point if they have one (young has a transport line).
 * 2. If not, the session if it has a specific date.
 * 3. If not, the default date for the cohort.
 */
function getReturnDate(young, session, cohort, meetingPoint: any = null) {
  if (meetingPoint?.bus || meetingPoint?.ligneBus || meetingPoint?.departuredDate) return getMeetingPointReturnDate(meetingPoint);
  if (young?.status && young.status !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) return getCenterReturnDate(young, session, cohort);
  return getGlobalReturnDate(young, cohort);
}

function getMeetingPointReturnDate(meetingPoint) {
  if (meetingPoint?.bus?.returnDate) return new Date(meetingPoint?.bus?.returnDate);
  if (meetingPoint?.ligneBus?.returnDate) return new Date(meetingPoint?.ligneBus?.returnDate);
  return new Date(meetingPoint?.returnDate);
}

function getCenterReturnDate(young, session, cohort) {
  if (session?.dateEnd) return new Date(session?.dateEnd);
  return getGlobalReturnDate(young, cohort);
}

function getGlobalReturnDate(young, cohort) {
  if (young?.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 16);
  }
  if (cohort?.dateEnd) return new Date(cohort.dateEnd);
  return new Date();
}

/**
 * @param {object} [meetingPoint]
 * @returns {string} the hour of the departure of the young from the meeting point if they have one,
 * or a default hour if they don't (local transport or traveling by own means).
 */
function getMeetingHour(meetingPoint: any = null) {
  if (meetingPoint?.meetingHour) return meetingPoint.meetingHour;
  if (meetingPoint?.ligneToPoint?.meetingHour) return meetingPoint.ligneToPoint.meetingHour;
  return TRANSPORT_TIMES.ALONE_ARRIVAL_HOUR;
}

/**
 * @param {object} [meetingPoint]
 * @returns {string} the hour of the return of the young to the meeting point if they have one,
 * or a default hour if they don't (local transport or traveling by own means).
 */
function getReturnHour(meetingPoint: any = null) {
  if (meetingPoint?.returnHour) return meetingPoint.returnHour;
  if (meetingPoint?.ligneToPoint?.returnHour) return meetingPoint.ligneToPoint.returnHour;
  return TRANSPORT_TIMES.ALONE_DEPARTURE_HOUR;
}

/**
 * Get the transport dates and returns a formatted string
 * e.g "du 5 au 17 juillet 2023"
 * @param {date} departureDate
 * @param {date} returnDate
 * @returns {string}
 */
const transportDatesToString = (departureDate, returnDate) => {
  if (departureDate.getMonth() === returnDate.getMonth()) {
    return `du ${departureDate.getDate()} au ${returnDate.getDate()} ${departureDate.toLocaleString("fr", { month: "long", year: "numeric" })}`;
  }
  return `du ${departureDate.getDate()} ${departureDate.toLocaleString("fr", { month: "long" })} au ${returnDate.getDate()} ${returnDate.toLocaleString("fr", {
    month: "long",
    year: "numeric",
  })}`;
};

export { TRANSPORT_TIMES, getDepartureDate, getGlobalDepartureDate, getReturnDate, getGlobalReturnDate, getMeetingHour, getReturnHour, transportDatesToString };

export default {
  TRANSPORT_TIMES,
  getDepartureDate,
  getGlobalDepartureDate,
  getReturnDate,
  getGlobalReturnDate,
  getMeetingHour,
  getReturnHour,
  transportDatesToString,
};
