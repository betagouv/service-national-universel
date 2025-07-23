const { PERMISSION_CODES, PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLES } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    await PermissionModel.create({
      code: PERMISSION_CODES.EXPORT_READ,
      titre: "Téléchargement des exports",
      resource: PERMISSION_RESOURCES.EXPORT,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.ADMINISTRATEUR_CLE, ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({
      code: PERMISSION_CODES.EXPORT_READ,
      resource: PERMISSION_RESOURCES.EXPORT,
      action: PERMISSION_ACTIONS.READ,
    });
  },
};
