import { PermissionType } from "../mongoSchema/permissions/permission";
import { UserDto } from "../dto";

export interface HasPermissionParams {
  user: UserDto;
  action?: PermissionType["action"];
  ressource: PermissionType["ressource"];
  context?: PermissionContext;
}

export interface PermissionContext {
  referent?: Record<string, string>;
  [key: string]: Record<string, string> | undefined;
}

export interface HasPermissionsParams extends Omit<HasPermissionParams, "ressource" | "action"> {
  permissions: {
    ressource: PermissionType["ressource"];
    action?: PermissionType["action"];
  }[];
}
