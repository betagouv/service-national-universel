import { COHORTS_ACTIONS } from "./actions";
import { CohortDto } from "snu-lib/src/dto/cohortDto";

const initialState = [];

export type CohortState = {
  // TODO: use API route response
  Cohorts: CohortDto[];
};

const reducer = (oldState = initialState, action) => {
  switch (action.type) {
    case COHORTS_ACTIONS.SET_COHORTS:
      return action.payload.sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateEnd).getTime());
    default:
      return oldState;
  }
};

export default reducer;
