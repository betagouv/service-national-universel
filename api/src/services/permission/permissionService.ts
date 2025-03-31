import { CohortType, RolePermission, UserDto } from "snu-lib";
import { getPermissionsByRole } from "./permissionRepository";
import { isWithinInterval } from "date-fns";

interface IPermissionService {
  check(action: string, cohort?: CohortType): boolean;
}

export class PermissionService implements IPermissionService {
  private permissions: Record<string, RolePermission> = {};

  constructor(user: UserDto) {
    this.init(user);
  }

  private async init(user: UserDto) {
    this.permissions = await getPermissionsByRole(user.role);
  }

  check(action: string, cohort?: CohortType): boolean {
    // if (this.user.subRole === "god") return true;
    const permission = this.permissions[action];
    if (permission?.value) {
      return permission.value;
    }
    if (permission?.startAt && permission?.endAt) {
      if (!cohort) throw new Error(`Cohort is required for permission ${action}`);
      const start = new Date(cohort![permission.startAt]);
      const end = new Date(cohort![permission.endAt]);
      const now = new Date();
      if (isWithinInterval(now, { start, end })) {
        return true;
      }
      return false;
    }
    if (permission?.endAt) {
      if (!cohort) throw new Error(`Cohort is required for permission ${action}`);
      if (new Date() > cohort[permission.endAt]) {
        return false;
      }
    }
    if (permission?.setting) {
      if (!cohort) throw new Error(`Cohort is required for permission ${action}`);
      return cohort[permission.setting] as boolean;
    }
    return false;
  }
}
