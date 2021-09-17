export const authActions = {
  SETYOUNG: "SETYOUNG",
};

export function setYoung(young) {
  if (window && young)
    window.zammadUser = {
      email: young.email,
      name: young.firstName + " " + young.lastName,
      _id: young._id,
    };
  return { type: authActions.SETYOUNG, young };
}
