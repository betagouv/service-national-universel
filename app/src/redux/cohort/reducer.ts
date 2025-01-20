import { CohortType } from "snu-lib";

import { authActions } from "./actions";

type Action = {
  type: string;
  cohort?: CohortType;
};

export type CohortState = {
  // TODO: use API route response
  Cohort: {
    cohort: CohortType;
  };
};

const initState = {
  cohort: null,
};

export default function reducer(state = initState, action: Action) {
  switch (action.type) {
    case authActions.SETCOHORT:
      return { ...state, cohort: action.cohort };
    default:
      return state;
  }
}
