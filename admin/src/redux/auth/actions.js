import { translate } from "../../utils";

export const authActions = {
  SETUSER: "SETUSER",
  SETSTRUCTURE: "SETSTRUCTURE",
  SETTICKETS: "SETTICKETS",
};

export function setUser(user) {
  if (window && user)
    window.zammadUser = {
      email: user.email,
      name: user.firstName + " " + user.lastName,
      department: user.department,
      role: translate(user.role),
      subRole: translate(user.subRole),
      structureId: user.structureId,
      _id: user._id,
    };
  return { type: authActions.SETUSER, user };
}

export function setStructure(structure) {
  return { type: authActions.SETSTRUCTURE, structure };
}

export function setTickets(tickets) {
  return { type: authActions.SETTICKETS, tickets };
}
