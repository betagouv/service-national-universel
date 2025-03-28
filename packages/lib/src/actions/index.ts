import { contractActions } from "./contractActions";
import { phase1Actions } from "./phase1Actions";
import { transportActions } from "./transportActions";

export const actions = {
  transport: transportActions,
  phase1: phase1Actions,
  contract: contractActions,
};
