import { CohortModel } from "../../models";

async function createCohortHelper(cohort) {
  return await CohortModel.create(cohort);
}

async function getSessionPhase1ById(id) {
  return await CohortModel.findById(id);
}

const notExistingSessionPhase1Id = "104a49ba503555e4d8853003";

export { createCohortHelper, getSessionPhase1ById, notExistingSessionPhase1Id };
