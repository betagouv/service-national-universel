import { SessionPhase1Model } from "../../models";

async function createSessionPhase1(sessionPhase1) {
  return await SessionPhase1Model.create(sessionPhase1);
}

async function getSessionPhase1ById(id) {
  return await SessionPhase1Model.findById(id);
}

const notExistingSessionPhase1Id = "104a49ba503555e4d8853003";

export { createSessionPhase1, getSessionPhase1ById, notExistingSessionPhase1Id };
