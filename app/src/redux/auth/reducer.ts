import { FeatureFlagName, YoungType } from "snu-lib";

import { authActions } from "./actions";

// Les réponses d'auth (signin, signin_token, refresh_token…) attachent les featureFlags au young sérialisé.
export type AuthYoung = YoungType & { featureFlags?: Partial<Record<FeatureFlagName, boolean>> };

type Action = {
  type: string;
  young?: AuthYoung;
};

export type AuthState = {
  // TODO: use API route response
  Auth: {
    young: AuthYoung;
  };
};

const initState = {
  young: null,
};

export default function reducer(state = initState, action: Action) {
  switch (action.type) {
    case authActions.SETYOUNG:
      return { ...state, young: action.young };
    default:
      return state;
  }
}
