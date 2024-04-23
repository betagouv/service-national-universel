const initialState = [];

export type CohortState = {
  // TODO: use API route response
  Cohorts: {
    name: string;
    dateStart: string;
    dateEnd: string;
  }[];
};

const reducer = (oldState = initialState, action) => {
  switch (action.type) {
    case "SET_COHORTS":
      return action.payload.sort((a, b) => new Date(b.dateStart).getTime() - new Date(a.dateEnd).getTime());
    default:
      return oldState;
  }
};

export default reducer;
