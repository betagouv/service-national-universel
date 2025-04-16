import { UserDto } from "../dto";
import { PERMISSION_ACTIONS } from "./constantes/actions";
import { HasPermissionParams } from "./types";

export function isAuthorized({ user, code, action = PERMISSION_ACTIONS.READ }: Omit<HasPermissionParams, "user"> & { user: UserDto }): boolean {
  if (user.acl?.find((acl) => acl.code === code && [action, PERMISSION_ACTIONS.FULL].includes(acl.action))) {
    return true;
  }
  return false;
}
