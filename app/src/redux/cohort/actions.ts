import { CohortType } from "snu-lib";

export const authActions = {
  SETCOHORT: "SETCOHORT",
};

export function setCohort(cohort?: CohortType) {
  return { type: authActions.SETCOHORT, cohort };
}
