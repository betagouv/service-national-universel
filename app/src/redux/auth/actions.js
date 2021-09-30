export const authActions = {
  SETYOUNG: "SETYOUNG",
};

export function setYoung(young) {
  return { type: authActions.SETYOUNG, young };
}
