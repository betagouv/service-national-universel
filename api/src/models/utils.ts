import { UserSaved } from "./types";
export function getUserToSave(fromUser: UserSaved): UserSaved {
  let user: UserSaved;
  if (fromUser.impersonatedBy) {
    const userToSave: UserSaved = {
      _id: fromUser._id,
      role: fromUser.role,
      department: fromUser.department,
      region: fromUser.region,
      email: fromUser.email,
      firstName: fromUser.firstName,
      lastName: fromUser.lastName,
      model: fromUser.model,

      impersonatedBy: {
        _id: fromUser.impersonatedBy._id,
        role: fromUser.impersonatedBy.role,
        department: fromUser.impersonatedBy.department,
        region: fromUser.impersonatedBy.region,
        email: fromUser.impersonatedBy.email,
        firstName: fromUser.impersonatedBy.firstName,
        lastName: fromUser.impersonatedBy.lastName,
        model: fromUser.impersonatedBy.model,
      },
    };

    user = userToSave;
  } else {
    user = fromUser;
  }
  return user;
}
