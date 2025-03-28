import { permissions, RolePermissions } from "snu-lib";

export async function getPermissionsByRole(role: string): Promise<RolePermissions> {
  // TODO: Move to DB
  const permission = permissions.find((p) => p.role === role)?.permissions;
  if (!permission) {
    throw new Error(`Permissions not found for role ${role}`);
  }
  return permission;
}
