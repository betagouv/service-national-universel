import { authActions } from "./actions";

const initState = {
  user: null,
  organisation: null,
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case authActions.SETUSER:
      return { ...state, user: action.user };
    case authActions.SETORGANISATION:
      return { ...state, organisation: action.organisation };
    default:
      return state;
  }
}
