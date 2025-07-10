const { PERMISSION_CODES, PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLE_JEUNE, ROLES } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    await PermissionModel.create({
      code: PERMISSION_CODES.USER_READ,
      titre: "Lecture sur les référents",
      resource: PERMISSION_RESOURCES.REFERENT,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE],
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_READ });
  },
};
