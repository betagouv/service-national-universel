import { CohortType, RolePermissions, UserDto } from "snu-lib";
import { getPermissionsByRole } from "./permissionRepository";

interface IPermissionService {
  check(action: string, cohort?: CohortType): boolean;
}

export class PermissionService implements IPermissionService {
  private permissions: RolePermissions = {};

  constructor(user: UserDto) {
    this.init(user);
  }

  private async init(user: UserDto) {
    this.permissions = await getPermissionsByRole(user.role);
  }

  check(action: string, cohort?: CohortType): boolean {
    // if (this.user.subRole === "god") return true;
    const permission = this.permissions[action];
    if (permission?.setting) {
      if (!cohort) throw new Error(`Cohort is required for permission ${action}`);
      return cohort[permission.setting] as boolean;
    }
    if (permission?.value) {
      return permission.value;
    }
    return false;
  }
}
