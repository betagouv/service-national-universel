const { PERMISSION_CODES, PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLES } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    await PermissionModel.create({
      code: PERMISSION_CODES.STRUCTURE_CREATE,
      titre: "Création de structures",
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.CREATE,
      roles: [ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION],
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.STRUCTURE_CREATE });
  },
};
