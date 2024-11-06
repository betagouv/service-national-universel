import { InscriptionGoalModel } from "../../models";

async function createInscriptionGoal(e) {
  return await InscriptionGoalModel.create(e);
}

export { createInscriptionGoal };
