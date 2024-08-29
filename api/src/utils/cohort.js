const { getRegionForEligibility, regionsListDROMS, COHORT_TYPE, COHORT_STATUS } = require("snu-lib");
const { YoungModel, CohortModel, InscriptionGoalModel } = require("../models");

async function getFilteredSessions(young, timeZoneOffset = null) {
  const cohorts = await CohortModel.find({ type: COHORT_TYPE.VOLONTAIRE, status: COHORT_STATUS.ACTIVE });

  const region = getRegionForEligibility(young);

  const formattedCohorts = cohorts.map((cohort) => {
    return {
      ...cohort.toObject(),
      isOpen: cohort.isOpen(young, timeZoneOffset),
      isEligible: cohort.isEligible(young),
    };
  });

  const formattedCohortsWithPlaces = await getPlaces(formattedCohorts, region);
  return formattedCohortsWithPlaces.filter((cohort) => cohort.isEligible);
}

async function getAllSessions(young) {
  const cohorts = await CohortModel.find({ type: COHORT_TYPE.VOLONTAIRE, status: COHORT_STATUS.ACTIVE });

  const region = getRegionForEligibility(young);

  const formattedCohorts = cohorts.map((cohort) => {
    return {
      ...cohort.toObject(),
      isOpen: cohort.isOpen(young, null),
      isEligible: cohort.isEligible(young),
    };
  });

  const formattedCohortsWithPlaces = await getPlaces(formattedCohorts, region);

  return formattedCohortsWithPlaces;
}

async function getFilteredSessionsForCLE() {
  const sessionsCLE = await CohortModel.find({ type: COHORT_TYPE.CLE });
  let now = Date.now();
  const sessions = sessionsCLE.filter(
    (session) =>
      !!session.inscriptionStartDate &&
      session.inscriptionStartDate <= now &&
      ((session.inscriptionEndDate && session.inscriptionEndDate > now) || (session.instructionEndDate && session.instructionEndDate > now)),
  );
  return sessions;
}

async function getPlaces(sessions, region) {
  const cohorts = await CohortModel.find({});
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

  const cohortIds = cohorts.map((s) => s._id.toString());
  const sessionObj = sessions.map((session) => {
    if (cohorts.map((e) => e.name).includes(session.name)) {
      return { ...session.toObject() };
    }
    return session;
  });

  for (let session of sessionObj) {
    if (session._id && cohortIds.includes(session._id.toString())) {
      session.numberOfCandidates = agg.find(({ _id }) => _id === session.name)?.candidates || 0;
      session.numberOfValidated = agg.find(({ _id }) => _id === session.name)?.validated || 0;
      session.goal = goals.find(({ _id }) => _id === session.name)?.total;
      session.goalReached = session.goal <= 0 ? true : session.numberOfCandidates + session.numberOfValidated >= session.goal * session.buffer;
      session.isFull = session.goal <= 0 ? true : session.numberOfValidated >= session.goal;
      session.isEligible = sessions.some((e) => e.name === session.name);
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

function getDepartureDateSession(session, young, cohort) {
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

function getReturnDateSession(session, young, cohort) {
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
  getFilteredSessionsForCLE,
};
