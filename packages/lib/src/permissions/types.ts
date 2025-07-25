import { PermissionType } from "../mongoSchema/permissions/permission";
import { UserDto } from "../dto";

export interface HasPermissionParams {
  user: UserDto;
  action?: PermissionType["action"];
  resource: PermissionType["resource"];
  context?: PermissionContext;
  ignorePolicy?: boolean;
}

export interface PermissionContext {
  referent?: Record<string, string>;
  [key: string]: Record<string, string> | null | undefined;
}

export interface HasPermissionsParams extends Omit<HasPermissionParams, "resource" | "action"> {
  permissions: {
    resource: PermissionType["resource"];
    action?: PermissionType["action"];
    ignorePolicy?: boolean;
  }[];
}
