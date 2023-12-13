const InscriptionGoalObject = require("../../Infrastructure/Databases/Mongo/Models/inscriptionGoal");

async function createInscriptionGoal(e) {
  return await InscriptionGoalObject.create(e);
}

module.exports = {
  createInscriptionGoal,
};
