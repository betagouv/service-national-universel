import { PermissionDocument, PermissionModel } from "../../models/permissions/permission";

export const PermissionRepository = {
  findByCodesRolesAndActions: async (codes: string[], roles: string[], actions: string[]): Promise<PermissionDocument[]> => {
    const permissions = await PermissionModel.find({
      code: { $in: codes },
      action: { $in: actions },
      roles: { $in: roles },
    });
    return permissions;
  },

  findByCodesRolesResourceAndActions: async (codes: string[], roles: string[], resource: string, actions: string[]): Promise<PermissionDocument[]> => {
    const permissions = await PermissionModel.find({
      code: { $in: codes },
      resource,
      action: { $in: actions },
      roles: { $in: roles },
    });
    return permissions;
  },

  findByRoles: async (roles: string[]): Promise<PermissionDocument[]> => {
    const permissions = await PermissionModel.find({
      roles: { $in: roles },
    });
    return permissions;
  },
};
