import { PermissionType } from "snu-lib";
import { PermissionModel } from "../../models/permissions/permission";
import { RoleModel } from "../../models/permissions/role";

export const addPermissionHelper = async (
  roles: PermissionType["roles"],
  resource: PermissionType["resource"],
  action: PermissionType["action"],
  policy?: PermissionType["policy"],
) => {
  for (const role of roles) {
    if (!(await RoleModel.findOne({ code: role }))) {
      await RoleModel.create({
        code: role,
        titre: role,
      });
    }
  }
  await PermissionModel.create({
    code: `${resource}_${action}_${new Date().getTime()}`,
    titre: `${resource} ${action}`,
    resource,
    action,
    roles,
    policy,
  });
};
