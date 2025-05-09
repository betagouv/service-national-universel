import { UserSaved } from "../mongoSchema/types";
export function buildPatchUser(fromUser: UserSaved): UserSaved {
  if (fromUser.impersonatedBy) {
    return {
      ...getVirtualUser(fromUser),
      impersonatedBy: getVirtualUser(fromUser.impersonatedBy),
    };
  }
  return fromUser;
}

export function getVirtualUser(user: UserSaved) {
  if (user) {
    const { _id, role, department, region, email, firstName, lastName, model, impersonatedBy } = user;
    const virtualUser = { _id, role, department, region, email, firstName, lastName, model, impersonatedBy };
    return virtualUser;
  }
  return undefined;
}
