const { YOUNG_STATUS, getZoneByDepartment, sessions2023 } = require("snu-lib");
const InscriptionGoalModel = require("../models/inscriptionGoal");
const YoungModel = require("../models/young");

async function getAvailableSessions(department, schoolLevel, birthDate, status) {
  let sessions = sessions2023.filter(
    (session) =>
      session.eligibility.zones.includes(getZoneByDepartment(department)) &&
      session.eligibility.schoolLevels.includes(schoolLevel) &&
      session.eligibility.bornAfter < birthDate &&
      session.eligibility.bornBefore > birthDate &&
      (session.eligibility.inscriptionEndDate > Date.now() ||
        ([YOUNG_STATUS.WAITING_CORRECTION, YOUNG_STATUS.WAITING_VALIDATION].includes(status) && session.eligibility.instructionEnDate > Date.now())),
  );
  for (let session of sessions) {
    session.goalReached = await isGoalReached(department, session.name);
    session.isFull = await isSessionFull(department, session.name);
  }
  return sessions;
}

async function isGoalReached(department, cohort) {
  const inscriptionGoal = await InscriptionGoalModel.findOne({ department: department, cohort: cohort });
  if (inscriptionGoal && inscriptionGoal.max) {
    const nbYoung = await YoungModel.countDocuments({
      department: department,
      cohort: cohort,
      status: { $nin: [YOUNG_STATUS.DELETED, YOUNG_STATUS.NOT_AUTORISED, YOUNG_STATUS.NOT_ELIGIBLE, YOUNG_STATUS.REFUSED, YOUNG_STATUS.WITHDRAWN] },
    });
    if (nbYoung > 0) {
      const fillingRatio = nbYoung / Math.floor(inscriptionGoal.max * cohort.buffer);
      if (fillingRatio >= 1) return true;
    }
  }
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
