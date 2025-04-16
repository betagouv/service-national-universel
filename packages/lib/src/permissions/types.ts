import { ReferentType } from "../mongoSchema/referent";
import { PermissionType } from "../mongoSchema/permissions/permission";

export interface HasPermissionParams {
  user: Partial<ReferentType>;
  action?: PermissionType["action"];
  code: PermissionType["code"];
  context?: PermissionContext;
}

export interface PermissionContext {
  ressource: PermissionType["ressource"];
  ressourceId?: string;
}

export interface HasPermissionsParams extends Omit<HasPermissionParams, "code"> {
  codes: string[];
}
