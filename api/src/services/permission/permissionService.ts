import { CohortType, UserDto } from "snu-lib";
import { getPermissions } from "./permissionRepository";

interface IPermissionService {
  check(user: UserDto, action: string, cohort?: CohortType): boolean;
}

export type Permissions = Record<string, Record<string, boolean | string>>;

export class PermissionService implements IPermissionService {
  private permissions: Permissions = {};

  constructor() {
    this.init();
  }

  private async init() {
    this.permissions = await getPermissions();
  }

  check(user: UserDto, action: string, cohort?: CohortType): boolean {
    if (!this.permissions[action]) throw new Error(`Action ${action} not found`);
    const permission = this.permissions[action][user.role];
    if (!permission) return false;
    if (typeof permission === "string") {
      if (!cohort) throw new Error(`Cohort is required for permission ${action}`);
      return cohort[permission] as boolean;
    }
    return permission;
  }
}
