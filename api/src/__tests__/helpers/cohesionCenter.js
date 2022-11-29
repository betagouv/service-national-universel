const CohesionCenterObject = require("../../models/cohesionCenter");
const SessionPhase1 = require("../../models/sessionPhase1");

async function createCohesionCenter(cohesionCenter) {
  return await CohesionCenterObject.create(cohesionCenter);
}

async function createCohesionCenterWithSession(cohesionCenter, session) {
  const center = await CohesionCenterObject.create(cohesionCenter);
  await SessionPhase1.create({ ...session, cohesionCenterId: center._id });
  return center;
}

async function createSessionWithCohesionCenter(cohesionCenter, session) {
  const center = await CohesionCenterObject.create(cohesionCenter);
  const returnedSession = await SessionPhase1.create({ ...session, cohesionCenterId: center._id });
  console.log(center, returnedSession);
  return returnedSession;
}

async function getCohesionCenterById(id) {
  return await CohesionCenterObject.findById(id);
}

const notExistingCohesionCenterId = "104a49ba503555e4d8853003";

module.exports = {
  createCohesionCenter,
  getCohesionCenterById,
  createCohesionCenterWithSession,
  createSessionWithCohesionCenter,
  notExistingCohesionCenterId,
};
