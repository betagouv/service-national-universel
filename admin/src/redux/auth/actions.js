import * as Sentry from "@sentry/react";

export const authActions = {
  SETUSER: "SETUSER",
  SETSTRUCTURE: "SETSTRUCTURE",
  SETSESSIONPHASE1: "SETSESSIONPHASE1",
  SETTICKETS: "SETTICKETS",
  SETPREVIOUSSIGNIN: "SETPREVIOUSSIGNIN",
};

export function setUser(user) {
  if (user) Sentry.setUser({ id: user._id, email: user.email, username: `${user.firstName} ${user.lastName}` });
  else Sentry.setUser(null);
  return { type: authActions.SETUSER, user };
}

export function setStructure(structure) {
  return { type: authActions.SETSTRUCTURE, structure };
}

export function setSessionPhase1(sessionPhase1) {
  return { type: authActions.SETSESSIONPHASE1, sessionPhase1 };
}

export function setTickets(tickets) {
  return { type: authActions.SETTICKETS, tickets };
}

export function setPreviousSignin(previousSigninToken) {
  return { type: authActions.SETPREVIOUSSIGNIN, previousSigninToken };
}
