import { CohortType, RolePermission, UserDto } from "snu-lib";
import { getPermissionsByRole } from "./permissionRepository";
import { isWithinInterval } from "date-fns";

interface IPermissionService {
  check(action: string, cohort?: CohortType): boolean;
}

export class PermissionService implements IPermissionService {
  private permissions: RolePermission[] = [];

  constructor(user: UserDto) {
    this.init(user);
  }

  private async init(user: UserDto) {
    this.permissions = await getPermissionsByRole(user.role);
  }

  check(action: string, cohort?: CohortType): boolean {
    // if (this.user.subRole === "god") return true;
    const permission = this.permissions.find((p) => p.name === action);
    if (!permission) {
      return false;
    }
    if (permission.value) {
      return permission.value;
    }
    if (permission.setting || permission.startAt || permission.endAt) {
      if (!cohort) {
        throw new Error(`Cohort is required for permission ${action}`);
      }
      if (permission.setting) {
        return cohort[permission.setting] as boolean;
      }
      if (permission.startAt && permission.endAt) {
        const start = new Date(cohort[permission.startAt]);
        const end = new Date(cohort[permission.endAt]);
        const now = new Date();
        if (isWithinInterval(now, { start, end })) {
          return true;
        }
        return false;
      }
    }
    return false;
  }
}
