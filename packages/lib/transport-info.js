import { YOUNG_STATUS_PHASE1 } from "./constants";

const TRANSPORT_TIMES = {
  ALONE_ARRIVAL_HOUR: "11:00",
  ALONE_DEPARTURE_HOUR: "16:00",
}

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
function getDepartureDate(young, session, cohort, meetingPoint = null) {
  if (!session && !cohort) throw new Error("getDepartureDate: session and cohort are required");
  if (meetingPoint?.bus || meetingPoint?.ligneBus || meetingPoint?.departuredDate) return getMeetingPointDepartureDate(meetingPoint);
  if (young.status !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) return getCenterArrivalDate(session, cohort);
  return getGlobalDepartureDate(cohort);
}

function getMeetingPointDepartureDate(meetingPoint) {
  if (meetingPoint?.bus?.departuredDate) return new Date(meetingPoint?.bus?.departuredDate);
  if (meetingPoint?.ligneBus?.departuredDate) return new Date(meetingPoint?.ligneBus?.departuredDate);
  return new Date(meetingPoint?.departuredDate);
}

function getCenterArrivalDate(session, cohort) {
  if (session?.dateStart) return new Date(session?.dateStart);
  return getGlobalDepartureDate(cohort);
}

function getGlobalDepartureDate(cohort) {
  return new Date(cohort.dateStart);
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
function getReturnDate(young, session, cohort, meetingPoint = null) {
  if (!session && !cohort) throw new Error("getReturnDate: session and cohort are required");
  if (meetingPoint?.bus || meetingPoint?.ligneBus || meetingPoint?.departuredDate) return getMeetingPointReturnDate(meetingPoint);
  if (young.status !== YOUNG_STATUS_PHASE1.WAITING_AFFECTATION) return getCenterReturnDate(session, cohort);
  return getGlobalReturnDate(cohort);
}

function getMeetingPointReturnDate(meetingPoint) {
  if (meetingPoint?.bus?.returnDate) return new Date(meetingPoint?.bus?.returnDate);
  if (meetingPoint?.ligneBus?.returnDate) return new Date(meetingPoint?.ligneBus?.returnDate);
  return new Date(meetingPoint?.returnDate);
}

function getCenterReturnDate(session, cohort) {
  if (session?.dateEnd) return new Date(session?.dateEnd);
  return getGlobalReturnDate(cohort);
}

function getGlobalReturnDate(cohort) {
  return new Date(cohort.dateEnd);
}

/**
 * @param {object} [meetingPoint]
 * @returns the hour of the departure of the young from the meeting point if they have one,
 * or a default hour if they don't (local transport or traveling by own means).
 */
function getMeetingHour(meetingPoint = null) {
  if (meetingPoint?.meetingHour) return meetingPoint.meetingHour;
  if (meetingPoint?.ligneToPoint?.meetingHour) return meetingPoint.ligneToPoint.meetingHour;
  return TRANSPORT_TIMES.ALONE_ARRIVAL_HOUR;
}

/**
 * @param {object} [meetingPoint]
 * @returns the hour of the return of the young to the meeting point if they have one,
 * or a default hour if they don't (local transport or traveling by own means).
 */
function getReturnHour(meetingPoint = null) {
  if (meetingPoint?.returnHour) return meetingPoint.returnHour;
  if (meetingPoint?.ligneToPoint?.returnHour) return meetingPoint.ligneToPoint.returnHour;
  return TRANSPORT_TIMES.ALONE_DEPARTURE_HOUR;
}

export {
  TRANSPORT_TIMES,
  getDepartureDate,
  getGlobalDepartureDate,
  getReturnDate,
  getGlobalReturnDate,
  getMeetingHour,
  getReturnHour,
}

export default {
  TRANSPORT_TIMES,
  getDepartureDate,
  getGlobalDepartureDate,
  getReturnDate,
  getGlobalReturnDate,
  getMeetingHour,
  getReturnHour,
}
