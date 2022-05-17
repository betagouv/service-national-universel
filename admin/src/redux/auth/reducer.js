import { authActions } from "./actions";

const initState = {
  user: null,
  structure: null,
  sessionPhase1: null,
  tickets: [],
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case authActions.SETUSER:
      return { ...state, user: action.user };
    case authActions.SETSTRUCTURE:
      return { ...state, structure: action.structure };
    case authActions.SETTICKETS:
      return { ...state, tickets: action.tickets };
    case authActions.SETSESSIONPHASE1:
      return { ...state, sessionPhase1: action.sessionPhase1 };
    default:
      return state;
  }
}
