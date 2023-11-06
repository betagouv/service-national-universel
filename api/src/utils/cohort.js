const { YOUNG_STATUS, region2zone, oldSessions, getRegionForEligibility, regionsListDROMS, START_DATE_PHASE1, END_DATE_PHASE1 } = require("snu-lib");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");
const CohortModel = require("../models/cohort");

async function getFilteredSessions(young, timeZoneOffset = null) {
  const sessions2023 = await CohortModel.find({});
  const region = getRegionForEligibility(young);

  let now = Date.now();

  if (timeZoneOffset) {
    const userTimezoneOffsetInMilliseconds = timeZoneOffset * 60 * 1000; // User's offset from UTC
    // Adjust server's time for user's timezone
    const adjustedTimeForUser = new Date().getTime() - userTimezoneOffsetInMilliseconds;
    now = new Date(adjustedTimeForUser);
  }

  const currentCohortYear = young.cohort ? new Date(sessions2023.find((c) => c.name === young.cohort)?.dateStart)?.getFullYear() : undefined;

  const sessions = sessions2023.filter(
    (session) =>
      // if the young has already a cohort, he can only apply for the cohorts of the same year
      (!young.cohort || currentCohortYear === session.dateStart.getFullYear()) &&
      session.eligibility?.zones.includes(region2zone[region]) &&
      session.eligibility?.schoolLevels.includes(young.grade) &&
      session.eligibility?.bornAfter <= young.birthdateAt &&
      session.eligibility?.bornBefore >= young.birthdateAt &&
      !!session.inscriptionStartDate &&
      session.inscriptionStartDate <= now &&
      ((session.inscriptionEndDate && session.inscriptionEndDate > now) ||
        ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION].includes(young.status) && session.instructionEndDate && session.instructionEndDate > now)),
  );

  for (let session of sessions) {
    session.isEligible = true;
  }
  return getPlaces(sessions, region);
}

async function getAllSessions(young) {
  const sessions2023 = await CohortModel.find({});
  const region = getRegionForEligibility(young);
  const sessionsWithPlaces = await getPlaces([...oldSessions, ...sessions2023], region);
  const availableSessions = await getFilteredSessions(young);
  for (let session of sessionsWithPlaces) {
    session.isEligible = availableSessions.find((e) => e.name === session.name) ? true : false;
  }
  return sessionsWithPlaces;
}

async function getPlaces(sessions, region) {
  const sessions2023 = await CohortModel.find({});
  const sessionNames = sessions.map(({ name }) => name);
  const goals = await InscriptionGoalModel.aggregate([{ $match: { region, cohort: { $in: sessionNames } } }, { $group: { _id: "$cohort", total: { $sum: "$max" } } }]);
  const agg = await YoungModel.aggregate([
    {
      $match: {
        $or: [
          { schooled: "true", schoolRegion: region },
          { schooled: "false", region },
        ],
        cohort: { $in: sessionNames },
      },
    },
    {
      $group: {
        _id: "$cohort",
        candidates: { $sum: { $cond: [{ $in: ["$status", ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "WAITING_LIST", "REINSCRIPTION"]] }, 1, 0] } },
        validated: { $sum: { $cond: [{ $in: ["$status", ["VALIDATED"]] }, 1, 0] } },
      },
    },
  ]);

  const session2023Ids = sessions2023.map((s) => s._id.toString());
  const sessionObj = sessions.map((session) => {
    if (sessions2023.map((e) => e.name).includes(session.name)) {
      return { ...session.toObject() };
    }
    return session;
  });

  for (let session of sessionObj) {
    if (session._id && session2023Ids.includes(session._id.toString())) {
      session.numberOfCandidates = agg.find(({ _id }) => _id === session.name)?.candidates || 0;
      session.numberOfValidated = agg.find(({ _id }) => _id === session.name)?.validated || 0;
      session.goal = goals.find(({ _id }) => _id === session.name)?.total;
      session.goalReached = session.goal <= 0 ? true : session.numberOfCandidates + session.numberOfValidated >= session.goal * session.buffer;
      session.isFull = session.goal <= 0 ? true : session.numberOfValidated >= session.goal;
    }
  }

  return sessionObj;
}

async function getCohortsEndAfter(date) {
  try {
    return CohortModel.find({ dateEnd: { $gte: date } });
  } catch (err) {
    return [];
  }
}

async function getCohortNamesEndAfter(date) {
  const cohorts = await getCohortsEndAfter(date);
  return cohorts.map((cohort) => cohort.name);
}

async function getCohortDateInfo(cohortName) {
  try {
    return CohortModel.findOne({ name: cohortName }, { validationDate: 1, validationDateForTerminaleGrade: 1, daysToValidate: 1, daysToValidateForTerminalGrade: 1, dateStart: 1 });
  } catch (err) {
    return {};
  }
}

async function getCohortValidationDate(cohortName) {
  try {
    return CohortModel.findOne({ name: cohortName }, { validationDate: 1, validationDateForTerminaleGrade: 1 });
  } catch (err) {
    return {};
  }
}

async function getDepartureDateSession(meetingPoint, session, young, cohort) {
  // Compatibility with legacy sessions
  const sessions2023 = await CohortModel.find({});
  if (!sessions2023.map((e) => e.name).includes(young.cohort)) {
    return START_DATE_PHASE1[young.cohort];
  }

  if (meetingPoint?.departuredDate) {
    return new Date(meetingPoint?.departuredDate);
  }
  if (session?.dateStart) {
    const sessionDateStart = new Date(session.dateStart);
    sessionDateStart.setHours(sessionDateStart.getHours() + 12);
    return sessionDateStart;
  }
  if (young.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 4);
  }
  const cohortDateStart = new Date(cohort?.dateStart);
  cohortDateStart.setHours(cohortDateStart.getHours() + 12);
  return new Date(cohortDateStart);
}

async function getReturnDateSession(meetingPoint, session, young, cohort) {
  const sessions2023 = await CohortModel.find({});
  // Compatibility with legacy sessions
  if (!sessions2023.map((e) => e.name).includes(young.cohort)) {
    return END_DATE_PHASE1[young.cohort];
  }

  if (meetingPoint?.returnDate) {
    return new Date(meetingPoint?.returnDate);
  }
  if (session?.dateEnd) {
    const sessionDateEnd = new Date(session.dateEnd);
    sessionDateEnd.setHours(sessionDateEnd.getHours() + 12);
    return sessionDateEnd;
  }
  if (young?.cohort === "Juillet 2023" && [...regionsListDROMS, "Polynésie française"].includes(young.region)) {
    return new Date(2023, 6, 16);
  }
  const cohortDateEnd = new Date(cohort?.dateEnd);
  cohortDateEnd.setHours(cohortDateEnd.getHours() + 12);
  return new Date(cohortDateEnd);
}

module.exports = {
  getFilteredSessions,
  getAllSessions,
  getCohortNamesEndAfter,
  getCohortsEndAfter,
  getCohortDateInfo,
  getCohortValidationDate,
  getDepartureDateSession,
  getReturnDateSession,
};
