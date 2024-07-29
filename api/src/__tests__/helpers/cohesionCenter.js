const { CohesionCenterModel, SessionPhase1Model } = require("../../models");

async function createCohesionCenter(cohesionCenter) {
  const center = await CohesionCenterModel.create(cohesionCenter);
  // Wait 100 ms to be sure that the center is created in the database
  await new Promise((resolve) => setTimeout(resolve, 100));
  return center;
}

async function createCohesionCenterWithSession(cohesionCenter, session) {
  const center = await CohesionCenterModel.create(cohesionCenter);
  await SessionPhase1Model.create({ ...session, cohesionCenterId: center._id });
  return center;
}

async function createSessionWithCohesionCenter(cohesionCenter, session) {
  const center = await CohesionCenterModel.create(cohesionCenter);
  const returnedSession = await SessionPhase1Model.create({ ...session, cohesionCenterId: center._id });
  return returnedSession;
}

async function getCohesionCenterById(id) {
  return await CohesionCenterModel.findById(id);
}

const notExistingCohesionCenterId = "104a49ba503555e4d8853003";

module.exports = {
  createCohesionCenter,
  getCohesionCenterById,
  createCohesionCenterWithSession,
  createSessionWithCohesionCenter,
  notExistingCohesionCenterId,
};
