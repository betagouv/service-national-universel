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
  };
};

const INITIAL_STATE = {
  user: null,
  structure: null,
  sessionPhase1: null,
  tickets: [],
};

export default function reducer(state = INITIAL_STATE, action) {
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
