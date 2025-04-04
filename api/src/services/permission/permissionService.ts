import { CohortType, RolePermission, UserDto } from "snu-lib";
import { getPermissionsByRole } from "./permissionRepository";
import { isWithinInterval } from "date-fns";

interface IPermissionService {
  has(action: string, cohort?: CohortType): boolean;
}

export class PermissionService implements IPermissionService {
  private permissions: RolePermission[] = [];
  private context?: { cohort?: CohortType };

  constructor(user: UserDto, context?: { cohort?: CohortType }) {
    this.init(user, context);
  }

  private async init(user: UserDto, context?: { cohort?: CohortType }) {
    this.permissions = await getPermissionsByRole(user.role);
    this.context = context;
  }

  has(action: string): boolean {
    // if (this.user.subRole === "god") return true;
    const permission = this.permissions.find((p) => p.name === action);
    if (!permission) {
      return false;
    }
    if (permission.value) {
      return permission.value;
    }
    if (permission.setting || permission.startAt || permission.endAt) {
      if (!this.context?.cohort) {
        throw new Error(`Cohort is required for permission ${action}`);
      }
      if (permission.setting) {
        return this.context.cohort[permission.setting] as boolean;
      }
      if (permission.startAt && permission.endAt) {
        const start = new Date(this.context.cohort[permission.startAt]);
        const end = new Date(this.context.cohort[permission.endAt]);
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
