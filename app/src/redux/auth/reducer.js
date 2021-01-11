import { authActions } from "./actions";

const initState = {
  young: null,
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case authActions.SETYOUNG:
      return { ...state, young: action.young };
    default:
      return state;
  }
}
