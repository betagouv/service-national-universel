const InscriptionGoalObject = require("../../models/inscriptionGoal");

async function createInscriptionGoal(e) {
  return await InscriptionGoalObject.create(e);
}

async function getInscriptionGoalHelper(params = {}) {
  return await InscriptionGoalObject.find(params);
}

async function deleteInscriptionGoalHelper() {
  return await InscriptionGoalObject.deleteMany({});
}

async function getInscriptionGoalByIdHelper(_id) {
  return await InscriptionGoalObject.findOne({ _id });
}

const notExistingInscriptionGoalId = "104a49ba503040e4d8853973";

module.exports = {
  createInscriptionGoal,
  getInscriptionGoalHelper,
  deleteInscriptionGoalHelper,
  notExistingInscriptionGoalId,
  getInscriptionGoalByIdHelper,
};
