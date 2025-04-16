import { RoleDocument, RoleModel } from "../../models/permissions/role";

export const RoleRepository = {
  findByCodesAndParent: async (codes: string[]): Promise<RoleDocument[]> => {
    const roles = await RoleModel.find({
      $or: [{ code: { $in: codes } }, { parent: { $in: codes } }],
    });
    return roles;
  },
};
