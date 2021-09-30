export const authActions = {
  SETUSER: "SETUSER",
  SETSTRUCTURE: "SETSTRUCTURE",
  SETTICKETS: "SETTICKETS",
};

export function setUser(user) {
  return { type: authActions.SETUSER, user };
}

export function setStructure(structure) {
  return { type: authActions.SETSTRUCTURE, structure };
}

export function setTickets(tickets) {
  return { type: authActions.SETTICKETS, tickets };
}
