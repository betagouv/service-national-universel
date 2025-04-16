import { HasPermissionParams, isAuthorized, PERMISSION_ACTIONS } from "snu-lib";
import { User } from "../types";

export function hasPermission({ user, code, action = PERMISSION_ACTIONS.READ }: Omit<HasPermissionParams, "user"> & { user: User }): boolean {
  return isAuthorized({ user, code, action });
}
