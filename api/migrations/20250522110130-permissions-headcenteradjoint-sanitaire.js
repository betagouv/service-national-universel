const { PERMISSION_CODES, ROLES, translate } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");
const { RoleModel } = require("../src/models/permissions/role");

module.exports = {
  async up(db, client) {
    await RoleModel.create({
      code: ROLES.HEAD_CENTER_ADJOINT,
      titre: translate(ROLES.HEAD_CENTER_ADJOINT),
    });
    await RoleModel.create({
      code: ROLES.REFERENT_SANITAIRE,
      titre: translate(ROLES.REFERENT_SANITAIRE),
    });
    await PermissionModel.updateMany(
      {
        code: { $in: [PERMISSION_CODES.DASHBOARD, PERMISSION_CODES.PROFILE, PERMISSION_CODES.SUPPORT_WRITE] },
      },
      {
        $push: {
          roles: [ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE],
        },
      },
    );
  },

  async down(db, client) {
    await RoleModel.deleteOne({ code: ROLES.HEAD_CENTER_ADJOINT });
    await RoleModel.deleteOne({ code: ROLES.REFERENT_SANITAIRE });
  },
};
