import { CohortGroupModel } from "../../models";

async function createCohortGroupHelper(cohort) {
  return await CohortGroupModel.create(cohort);
}

export { createCohortGroupHelper };
