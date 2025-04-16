const { ROLES, PERMISSION_ACTIONS, PERMISSION_CODES, PERMISSION_RESOURCES } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    await PermissionModel.create({
      code: PERMISSION_CODES.EXPORT_DSNJ,
      titre: "Export DSNJ",
      action: PERMISSION_ACTIONS.EXECUTE,
      roles: [ROLES.DSNJ, ROLES.ADMIN],
      ressource: PERMISSION_RESOURCES.EXPORT_DSNJ,
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.EXPORT_DSNJ });
  },
};
