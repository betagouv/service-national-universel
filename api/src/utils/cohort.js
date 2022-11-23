const { YOUNG_STATUS, getZoneByDepartment, sessions2023, departmentLookUp } = require("snu-lib");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");

async function getAvailableSessions(young) {
  let dep = young?.schoolDepartment || young?.department || null;
  if (dep && (!isNaN(dep) || ["2A", "2B"].includes(dep))) {
    if (dep.substring(0, 1) === "0" && dep.length === 3) dep = departmentLookUp[dep.substring(1)];
    else dep = departmentLookUp[dep];
  }
  let region = young?.schoolRegion || young?.region;
  let sessions = sessions2023.filter(
    (session) =>
      session.eligibility.zones.includes(getZoneByDepartment(dep)) &&
      session.eligibility.schoolLevels.includes(young.grade) &&
      session.eligibility.bornAfter < young.birthdateAt &&
      session.eligibility.bornBefore > young.birthdateAt &&
      (session.eligibility.inscriptionEndDate > Date.now() ||
        ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION].includes(young.status) && session.eligibility.instructionEnDate > Date.now())),
  );

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
        status: { $nin: [YOUNG_STATUS.DELETED, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.NOT_ELIGIBLE, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN] },
      },
    },
    { $group: { _id: "$cohort", total: { $sum: 1 } } },
  ]);

  const numberofRegistered = await YoungModel.aggregate([
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
    session.numberOfCandidates = numberOfCandidates.find(({ _id }) => _id === session.name)?.total;
    session.numberOfRegistered = numberofRegistered.find(({ _id }) => _id === session.name)?.total;
    session.numberOfPlaces = numberOfPlaces.find(({ _id }) => _id === session.name)?.total;
    session.isFull = session.numberOfRegistered >= session.places;
    session.goalReached = session.numberOfCandidates >= session.places * session.buffer;
  }
  return sessions;
}

module.exports = {
  getAvailableSessions,
};
