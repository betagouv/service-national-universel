import { regionsListDROMS } from "./region-and-departments";

const TRANSPORT_TIMES = {
  ALONE_ARRIVAL_HOUR: "11:00",
  ALONE_DEPARTURE_HOUR: "16:00",
}

const centersInJulyClosingEarly = [{
  "_id": {
    "$oid": "609bebb10c1cc9a888ae8fba"
  },
  "code": "SNU844210",
  "code2022": "ARALYO04203"
},
{
  "_id": {
    "$oid": "609bebb20c1cc9a888ae8fc2"
  },
  "code": "SNU846313",
  "code2022": "ARACLE06301"
},
{
  "_id": {
    "$oid": "609bebc60c1cc9a888ae909b"
  },
  "code": "SNU761102",
  "code2022": "OCCMON01101"
},
{
  "_id": {
    "$oid": "609bebca0c1cc9a888ae90c7"
  },
  "code": "SNU524401",
  "code2022": "PDLNAN04401"
},
{
  "_id": {
    "$oid": "60a7dd5aa9f80b075f068cea"
  },
  "code": "SNU117511",
  "code2022": "IDFPAR07501"
},
{
  "_id": {
    "$oid": "626b07616f7eb607e9b88b90"
  },
  "code2022": "ARAGRE03802"
},
{
  "_id": {
    "$oid": "63c553786a71d408cb817985"
  },
  "code2022": "GENAM08804"
},
{
  "_id": {
    "$oid": "63da4af647841408c5940c78"
  },
  "code2022": "PACNIC00601"
},
{
  "_id": {
    "$oid": "63dff1eeca0dad08c4d81261"
  },
  "code2022": "ARAGRE03805"
},
// pour test en staging
{
  "_id": {
    "$oid": "63873264a4ec702331abec5f"
  },
  "code2022": "ARAGRE03805"
}]

/**
 * @param {Object} young
 * @param {Object} [meetingPoint]
 * @param {Object} [session]
 * @param {Object} cohort
 * @returns {date} the date of departure to the cohesion center from the following resource:
 * 1. The meeting point if they have one (young has a transport line)
 * 2. If not, the session if it has a specific date
 * 3. If not, the default date for the cohort.
 */
function getDepartureDate(young, meetingPoint, session, cohort) {
  if (meetingPoint?.bus?.departuredDate) return new Date(meetingPoint?.bus?.departuredDate);
  if (meetingPoint?.departuredDate) return new Date(meetingPoint?.departuredDate);
  if (session?.dateStart) return new Date(session?.dateStart);
  return getGlobalDepartureDate(young, cohort);
}

function getGlobalDepartureDate(young, cohort) {
  if (young.cohort === "Juillet 2023" && ![...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 5);
  }
  return new Date(cohort.dateStart);
}

/**
 * @param {Object} young
 * @param {object} [meetingPoint]
 * @param {object} [session]
 * @param {object} cohort
 * @returns {date} the date of departure from the cohesion center from the following resource:
 * 1. The meeting point if they have one (young has a transport line).
 * 2. If not, the session if it has a specific date.
 * 3. If not, the default date for the cohort.
 */
function getReturnDate(young, meetingPoint = null, session = null, cohort = null) {
  if (meetingPoint?.returnDate) return meetingPoint?.returnDate;
  if (meetingPoint?.bus?.returnDate) return meetingPoint?.bus?.returnDate;
  if (session?.dateEnd) return new Date(session?.dateEnd);
  return getGlobalReturnDate(young, cohort);
}

function getGlobalReturnDate(young, cohort) {
  if (young.cohort === "Juillet 2023" && young.cohesionCenterId && centersInJulyClosingEarly.map((c) => c._id.$oid).includes(young.cohesionCenterId)) {
    return new Date(2021, 6, 16);
  }
  if (young.cohort === "Juillet 2023" && ![...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 17);
  }
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
  getDepartureDate,
  getGlobalDepartureDate,
  getReturnDate,
  getGlobalReturnDate,
  getMeetingHour,
  getReturnHour,
}

export default {
  getDepartureDate,
  getGlobalDepartureDate,
  getReturnDate,
  getGlobalReturnDate,
  getMeetingHour,
  getReturnHour,
}
