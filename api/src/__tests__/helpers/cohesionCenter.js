const CohesionCenterObject = require("../../models/cohesionCenter");

async function createCohesionCenter(cohesionCenter) {
  return await CohesionCenterObject.create(cohesionCenter);
}

async function getCohesionCenterById(id) {
  return await CohesionCenterObject.findById(id);
}

module.exports = {
  createCohesionCenter,
  getCohesionCenterById,
};
