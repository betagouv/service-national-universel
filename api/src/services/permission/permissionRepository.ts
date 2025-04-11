import { PermissionType } from "snu-lib";
import { RoleModel } from "../../models/role";

export async function getPermissionsByRole(role: string): Promise<PermissionType[]> {
  const roleDocument = await RoleModel.findOne({ name: role });
  if (!roleDocument) {
    throw new Error(`Role ${role} not found`);
  }
  const permissions = roleDocument.permissions;
  if (!permissions) {
    throw new Error(`Permissions not found for role ${role}`);
  }
  return permissions;
}
