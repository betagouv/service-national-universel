import { COHORTS_ACTIONS } from "./actions";
import { CohortDto } from "snu-lib";

const INITIAL_STATE: CohortDto[] = [];

export type CohortState = {
  // TODO: use API route response
  Cohorts: CohortDto[];
};

const reducer = (oldState = INITIAL_STATE, action) => {
  switch (action.type) {
    case COHORTS_ACTIONS.SET_COHORTS:
      return action.payload.sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateEnd).getTime());
    case COHORTS_ACTIONS.UPDATE_COHORT:
      return oldState.map((cohort) => {
        if (cohort._id === action.payload._id) {
          return action.payload;
        }
        return cohort;
      });
    default:
      return oldState;
  }
};

export default reducer;
