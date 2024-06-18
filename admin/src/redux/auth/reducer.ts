import { authActions } from "./actions";
import { User } from "@/types";

export type AuthState = {
  // TODO: use API route response
  Auth: {
    user: User;
    sessionPhase1: {
      _id: string;
      cohort: string;
      cohesionCenterId: string;
    };
    previousSigninToken?: string;
  };
};

const SS_KEY_PREVIOUS_SIGNIN = "previousSigninToken";

const initState = {
  user: null,
  structure: null,
  sessionPhase1: null,
  tickets: [],
  previousSigninToken: null,
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case authActions.SETUSER:
      // eslint-disable-next-line no-case-declarations
      const previousSigninToken = state.previousSigninToken || sessionStorage.getItem(SS_KEY_PREVIOUS_SIGNIN);
      return { ...state, user: action.user, previousSigninToken: !action.user ? null : previousSigninToken };
    case authActions.SETSTRUCTURE:
      return { ...state, structure: action.structure };
    case authActions.SETTICKETS:
      return { ...state, tickets: action.tickets };
    case authActions.SETSESSIONPHASE1:
      return { ...state, sessionPhase1: action.sessionPhase1 };
    case authActions.SETPREVIOUSSIGNIN:
      if (action.previousSigninToken) sessionStorage.setItem(SS_KEY_PREVIOUS_SIGNIN, action.previousSigninToken);
      else sessionStorage.removeItem(SS_KEY_PREVIOUS_SIGNIN);
      return { ...state, previousSigninToken: action.previousSigninToken };
    default:
      return state;
  }
}
