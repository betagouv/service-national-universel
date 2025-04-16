import { PermissionModel } from "../../models/permissions/permission";
import { RoleModel } from "../../models/permissions/role";

export async function createRole(code: string, parent?: string) {
  const role = await new RoleModel({
    code,
    titre: code,
    parent,
  }).save({ fromUser: { firstName: "test" } });
  return role;
}

export async function createPermission(code: string, roles: string[], ressource: string, action: string) {
  const permission = await new PermissionModel({
    code,
    roles,
    ressource,
    action,
    titre: code,
  }).save({ fromUser: { firstName: "test" } });
  return permission;
}
