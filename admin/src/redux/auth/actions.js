export const authActions = {
  SETUSER: "SETUSER",
  SETSTRUCTURE: "SETSTRUCTURE",
  SETSESSIONPHASE1: "SETSESSIONPHASE1",
  SETTICKETS: "SETTICKETS",
};

export function setUser(user) {
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
