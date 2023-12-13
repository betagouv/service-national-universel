const CohortObject = require("../../../Infrastructure/Databases/Mongo/Models/cohort");

async function createCohortHelper(cohort) {
  return await CohortObject.create(cohort);
}

async function getSessionPhase1ById(id) {
  return await CohortObject.findById(id);
}

const notExistingSessionPhase1Id = "104a49ba503555e4d8853003";

module.exports = {
  createCohortHelper,
  getSessionPhase1ById,
  notExistingSessionPhase1Id,
};
