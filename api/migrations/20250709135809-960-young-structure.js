const { PERMISSION_CODES, PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLE_JEUNE } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    await PermissionModel.create({
      code: PERMISSION_CODES.STRUCTURE_READ,
      titre: "Lecture sur les structures",
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLE_JEUNE],
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.STRUCTURE_READ });
  },
};
