const CohesionCenterObject = require("../../models/cohesionCenter");

async function createCohesionCenter(cohesionCenter) {
  return await CohesionCenterObject.create(cohesionCenter);
}

async function getCohesionCenterById(id) {
  return await CohesionCenterObject.findById(id);
}

const notExistingCohesionCenterId = "104a49ba503555e4d8853003";

module.exports = {
  createCohesionCenter,
  getCohesionCenterById,
  notExistingCohesionCenterId,
};
