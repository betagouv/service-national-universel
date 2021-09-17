import { translate } from "../../utils";
export const authActions = {
  SETYOUNG: "SETYOUNG",
};

export function setYoung(young) {
  if (window && young) {
    window.zammadUser = {
      email: young.email,
      name: young.firstName + " " + young.lastName,
      _id: young._id,
      status: translate(young.status),
      statusPhase1: translate(young.statusPhase1),
      statusPhase2: translate(young.statusPhase2),
      statusPhase3: translate(young.statusPhase3),
    };
  }
  return { type: authActions.SETYOUNG, young };
}
