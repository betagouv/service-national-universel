import { authActions } from "./actions";

const initState = {
  user: null,
  structure: null,
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case authActions.SETUSER:
      return { ...state, user: action.user };
    case authActions.SETSTRUCTURE:
      return { ...state, structure: action.structure };
    default:
      return state;
  }
}
