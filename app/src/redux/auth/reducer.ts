import { YoungType } from "snu-lib";

import { authActions } from "./actions";

export type AuthState = {
  // TODO: use API route response
  Auth: {
    young: YoungType;
  };
};

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
