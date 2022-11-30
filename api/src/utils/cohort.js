const { YOUNG_STATUS, getZoneByDepartment, sessions2023, departmentLookUp, getRegionByZip, getDepartmentByZip } = require("snu-lib");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");

async function getAvailableSessions(young) {
  let dep = young?.schoolDepartment || young?.department || getDepartmentByZip(young?.zip);
  if (dep && (!isNaN(dep) || ["2A", "2B"].includes(dep))) {
    if (dep.substring(0, 1) === "0" && dep.length === 3) dep = departmentLookUp[dep.substring(1)];
    else dep = departmentLookUp[dep];
  }
  let region = young?.schoolRegion || young?.region || getRegionByZip(young?.zip);

  const sessions = sessions2023.filter(
    (session) =>
      session.eligibility.zones.includes(getZoneByDepartment(dep)) &&
      session.eligibility.schoolLevels.includes(young.grade) &&
      session.eligibility.bornAfter < young.birthdateAt &&
      session.eligibility.bornBefore > young.birthdateAt &&
      (session.eligibility.inscriptionEndDate > Date.now() ||
        ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION].includes(young.status) && session.eligibility.instructionEnDate > Date.now())),
  );

  const sessionsWithPlaces = await getPlaces(sessions, region);
  return sessionsWithPlaces;
}

async function getAllSessions(young) {
  const oldSessions = [{ name: "2019" }, { name: "2020" }, { name: "2021" }, { name: "Février 2022" }, { name: "Juin 2022" }, { name: "Juillet 2022" }];
  let region = young?.schoolRegion || young?.region || getRegionByZip(young?.zip);
  const sessionsWithPlaces = await getPlaces([...oldSessions, ...sessions2023], region);
  return sessionsWithPlaces;
}

async function getPlaces(sessions, region) {
  const sessionNames = sessions.map(({ name }) => name);

  const numberOfPlaces = await InscriptionGoalModel.aggregate([
    { $match: { region: region, cohort: { $in: sessionNames } } },
    { $group: { _id: "$cohort", total: { $sum: "$max" } } },
  ]);

  const numberOfCandidates = await YoungModel.aggregate([
    {
      $match: {
        $or: [{ schoolRegion: region }, { schoolRegion: { $exists: false }, region }],
        cohort: { $in: sessionNames },
        status: { $nin: [YOUNG_STATUS.VALIDATED, YOUNG_STATUS.DELETED, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.NOT_ELIGIBLE, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN] },
      },
    },
    { $group: { _id: "$cohort", total: { $sum: 1 } } },
  ]);

  const numberOfValidated = await YoungModel.aggregate([
    {
      $match: {
        $or: [{ schoolRegion: region }, { schoolRegion: { $exists: false }, region }],
        cohort: { $in: sessionNames },
        status: YOUNG_STATUS.VALIDATED,
      },
    },
    { $group: { _id: "$cohort", total: { $sum: 1 } } },
  ]);

  for (let session of sessions) {
    if (sessions2023.includes(session)) {
      session.numberOfCandidates = numberOfCandidates.find(({ _id }) => _id === session.name)?.total;
      session.numberOfValidated = numberOfValidated.find(({ _id }) => _id === session.name)?.total;
      session.numberOfPlaces = numberOfPlaces.find(({ _id }) => _id === session.name)?.total;
      session.goalReached = session.numberOfCandidates + session.numberOfValidated >= session.numberOfPlaces * session.buffer;
      session.isFull = session.numberOfValidated >= session.numberOfPlaces;
    }
  }
  return sessions;
}

module.exports = {
  getAvailableSessions,
  getAllSessions,
};
