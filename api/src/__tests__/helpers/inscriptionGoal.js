const { InscriptionGoalModel } = require("../../models");

async function createInscriptionGoal(e) {
  return await InscriptionGoalModel.create(e);
}

module.exports = {
  createInscriptionGoal,
};
