import { CohortType, ConditionType, PermissionType, UserDto } from "snu-lib";
import { getPermissionsByRole } from "./permissionRepository";
import { isAfter, isBefore } from "date-fns";

interface IPermissionService {
  validate(action: string): boolean;
}

export class PermissionService implements IPermissionService {
  private permissions: PermissionType[] = [];
  private context?: Record<string, any>;

  constructor(user: UserDto, context?: { cohort?: CohortType }) {
    this.init(user, context);
  }

  private async init(user: UserDto, context?: { cohort?: CohortType }) {
    this.permissions = await getPermissionsByRole(user.role);
    this.context = context;
  }

  private checkCondition(condition: ConditionType): boolean {
    if (!this.context) {
      throw new Error("Context is required to assess condition");
    }
    if (!this.context[condition.modelName]) {
      throw new Error(`Context does not contain model ${condition.modelName}`);
    }
    const value = this.context[condition.modelName][condition.fieldName];
    switch (condition.type) {
      case "boolean":
        return value as boolean;
      case "startDate":
        return isAfter(new Date(), value);
      case "endDate":
        return isBefore(new Date(), value);
      default:
        throw new Error(`Unknown condition type: ${condition.type}`);
    }
  }

  validate(action: string): boolean {
    // if (this.user.subRole === "god") return true;
    const permission = this.permissions.find((p) => p.name === action);
    if (!permission) {
      return false;
    }
    if (!permission.conditions) {
      return true;
    }
    return permission.conditions.every((condition: ConditionType) => this.checkCondition(condition));
  }
}
