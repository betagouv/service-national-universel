const initialState = [];

const reducer = (oldState = initialState, action) => {
  switch (action.type) {
    case "SET_COHORTS":
      return action.payload.sort((a, b) => new Date(b.dateStart) - new Date(a.dateEnd));
    default:
      return oldState;
  }
};

export default reducer;
