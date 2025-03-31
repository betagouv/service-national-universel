import { roles, RolePermission } from "snu-lib";

export async function getPermissionsByRole(role: string): Promise<Record<string, RolePermission>> {
  // TODO: Move to DB
  const permissions = roles.find((roleDoc) => roleDoc.name === role)?.permissions;
  if (!permissions) {
    throw new Error(`Permissions not found for role ${role}`);
  }
  return permissions;
}
