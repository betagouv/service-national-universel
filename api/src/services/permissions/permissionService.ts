import { CohortType, UserDto } from "snu-lib";

interface IPermissionService {
  check(user: UserDto, cohort: CohortType, action: string): boolean;
}

type Permissions = Record<string, Record<string, boolean | string>>;

export class PermissionService implements IPermissionService {
  private permissions: Permissions = {};

  constructor() {
    this.init();
  }

  private async init() {
    this.permissions = await getPermissions();
  }

  check(user: UserDto, cohort: CohortType, action: string): boolean {
    if (!this.permissions[action]) throw new Error(`Action ${action} not found`);
    const permission = this.permissions[action][user.role];
    if (!permission) return false;
    if (typeof permission === "string") {
      return cohort[permission] as boolean;
    }
    return permission;
  }
}

async function getPermissions(): Promise<Permissions> {
  // TODO: Move to DB
  const json = await import("./permissions.json");
  return json.default;
}
