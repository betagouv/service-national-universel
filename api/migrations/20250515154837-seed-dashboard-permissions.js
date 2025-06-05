const { PERMISSION_CODES, PERMISSION_ACTIONS, ROLES, PERMISSION_RESOURCES } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    await PermissionModel.create({
      code: PERMISSION_CODES.DASHBOARD,
      titre: "Dashboard",
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.VISITOR, ROLES.HEAD_CENTER, ROLES.RESPONSIBLE, ROLES.SUPERVISOR, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT],
      resource: PERMISSION_RESOURCES.DASHBOARD,
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.DASHBOARD });
  },
};
