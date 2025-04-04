import { RolePermission, roleDocs } from "snu-lib";

export async function getPermissionsByRole(role: string): Promise<RolePermission[]> {
  // TODO: Move to DB
  const permissions = roleDocs.find((roleDoc) => roleDoc.name === role)?.permissions;
  if (!permissions) {
    throw new Error(`Permissions not found for role ${role}`);
  }
  return permissions;
}
