const SessionPhase1Object = require("../../models/sessionPhase1");

async function createSessionPhase1(sessionPhase1) {
  return await SessionPhase1Object.create(sessionPhase1);
}

async function getSessionPhase1ById(id) {
  return await SessionPhase1Object.findById(id);
}

const notExistingSessionPhase1Id = "104a49ba503555e4d8853003";

module.exports = {
  createSessionPhase1,
  getSessionPhase1ById,
  notExistingSessionPhase1Id,
};
