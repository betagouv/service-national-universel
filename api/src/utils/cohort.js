const { YOUNG_STATUS, getZoneByDepartment, sessions2023, departmentLookUp } = require("snu-lib");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");

async function getAvailableSessions(young) {
  let dep = young?.schoolDepartment || young?.department || null;
  if (!isNaN(dep) || ["2A", "2B"].includes(dep)) {
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
  for (let session of sessions) {
    session.goalReached = await isGoalReached(region, session.name);
    session.isFull = await isSessionFull(dep, session.name);
  }
  return sessions;
}

async function isGoalReached(region, cohort) {
  const nbYoung = await YoungModel.countDocuments({
    $or: [{ schoolRegion: region }, { schoolRegion: { $exists: false }, region }],
    cohort: cohort,
    status: { $nin: [YOUNG_STATUS.DELETED, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.NOT_ELIGIBLE, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN] },
  });
  const agg = await InscriptionGoalModel.aggregate([{ $match: { region: region } }, { $group: { _id: null, total: { $sum: "$max" } } }]);
  const nbPlaces = agg[0].total;
  const fillingRatio = nbYoung / Math.floor(nbPlaces * cohort.buffer);
  if (fillingRatio >= 1) return true;
  return false;
}

async function isSessionFull(department, cohort) {
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department: department, cohort: cohort });
  if (inscriptionGoal && inscriptionGoal.max) {
    const placesTaken = await YoungModel.countDocuments({
      $or: [{ schoolDepartment: department }, { schoolDepartment: { $exists: false }, department }],
      cohort: cohort,
      status: YOUNG_STATUS.VALIDATED,
    });
    if (placesTaken && placesTaken >= inscriptionGoal.max) return true;
  }
  return false;
}

module.exports = {
  getAvailableSessions,
  isGoalReached,
  isSessionFull,
};
