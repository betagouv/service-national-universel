const InscriptionGoalObject = require("../../models/inscriptionGoal");

async function createInscriptionGoal(e) {
  return await InscriptionGoalObject.create(e);
}

module.exports = {
  createInscriptionGoal,
};
