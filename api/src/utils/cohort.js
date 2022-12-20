const { YOUNG_STATUS, sessions2023, region2zone, oldSessions, getDepartmentByZip, departmentLookUp, department2region, getRegionByZip } = require("snu-lib");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");

function getRegionForEligibility(young) {
  let region = young.schooled ? young.schoolRegion : young.region;
  if (!region) {
    let dep = young?.schoolDepartment || young?.department || getDepartmentByZip(young?.zip);
    if (dep && (!isNaN(dep) || ["2A", "2B", "02A", "02B"].includes(dep))) {
      if (dep.substring(0, 1) === "0" && dep.length === 3) dep = departmentLookUp[dep.substring(1)];
      else dep = departmentLookUp[dep];
    }
    region = department2region[dep] || getRegionByZip(young?.zip);
  }
  if (!region) region = "Etranger";
  return region;
}

async function getFilteredSessions(young) {
  const region = getRegionForEligibility(young);
  const sessions = sessions2023.filter(
    (session) =>
      session.eligibility.zones.includes(region2zone[region]) &&
      session.eligibility.schoolLevels.includes(young.grade) &&
      session.eligibility.bornAfter < young.birthdateAt &&
      session.eligibility.bornBefore > young.birthdateAt &&
      (session.eligibility.inscriptionEndDate > Date.now() ||
        ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION].includes(young.status) && session.eligibility.instructionEnDate > Date.now())),
  );

  for (let session of sessions) session.isEligible = true;
  const sessionsWithPlaces = await getPlaces(sessions, region);
  return sessionsWithPlaces;
}

async function getAllSessions(young) {
  const region = getRegionForEligibility(young);
  const sessionsWithPlaces = await getPlaces([...oldSessions, ...sessions2023], region);
  const availableSessions = await getFilteredSessions(young);
  for (let session of sessionsWithPlaces) {
    if (availableSessions.includes(session)) session.isEligible = true;
    else session.isEligible = false;
  }
  return sessionsWithPlaces;
}

async function getPlaces(sessions, region) {
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
        candidates: {
          $sum: {
            $cond: [{ $in: ["$status", ["IN_PROGRESS", "WAITING_VALIDATION", "WAITING_CORRECTION", "WAITING_LIST", "REINSCRIPTION"]] }, "$status", 1],
          },
        },
        validated: {
          $sum: {
            $cond: [{ $in: ["$status", ["VALIDATED"]] }, "$status", 1],
          },
        },
      },
    },
  ]);

  for (let session of sessions) {
    if (sessions2023.includes(session)) {
      session.numberOfCandidates = agg.find(({ _id }) => _id === session.name)?.candidates || 0;
      session.numberOfValidated = agg.find(({ _id }) => _id === session.name)?.validated || 0;
      session.goal = goals.find(({ _id }) => _id === session.name)?.total;
      session.goalReached = session.goal <= 0 ? false : session.numberOfCandidates + session.numberOfValidated >= session.goal * session.buffer;
      session.isFull = session.goal <= 0 ? false : session.numberOfValidated >= session.goal;
    }
  }
  return sessions;
}

module.exports = {
  getFilteredSessions,
  getAllSessions,
};
