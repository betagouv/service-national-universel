export const authActions = {
  SETUSER: "SETUSER",
  SETORGANISATION: "SETORGANISATION",
};

export function setUser(user) {
  return { type: authActions.SETUSER, user };
}

export function setOrganisation(organisation) {
  return { type: authActions.SETORGANISATION, organisation };
}
