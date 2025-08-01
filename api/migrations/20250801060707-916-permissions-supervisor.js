const { PERMISSION_CODES, PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLES } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    let permission = await PermissionModel.findOne({
      code: PERMISSION_CODES.STRUCTURE_CREATE,
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.CREATE,
    });
    if (!permission) {
      throw new Error("Permission not found for structure create");
    }
    permission.roles.push(ROLES.SUPERVISOR);
    await permission.save();

    permission = await PermissionModel.findOne({
      code: PERMISSION_CODES.USER_HISTORY_READ,
      resource: PERMISSION_RESOURCES.USER_HISTORY,
      action: PERMISSION_ACTIONS.READ,
    });
    if (!permission) {
      throw new Error("Permission not found for user history read");
    }
    permission.roles.push(ROLES.SUPERVISOR);
    await permission.save();

    permission = await PermissionModel.findOne({
      code: PERMISSION_CODES.USER_NOTIFICATIONS_READ,
      resource: PERMISSION_RESOURCES.USER_NOTIFICATIONS,
      action: PERMISSION_ACTIONS.READ,
    });
    if (!permission) {
      throw new Error("Permission not found for user notifications read");
    }
    permission.roles.push(ROLES.SUPERVISOR);
    await permission.save();

    await PermissionModel.create({
      code: PERMISSION_CODES.PATCHES_READ,
      titre: "Accès en lecture sur les patches",
      resource: PERMISSION_RESOURCES.PATCH,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    });
  },

  async down(db, client) {
    let permission = await PermissionModel.findOne({
      code: PERMISSION_CODES.STRUCTURE_CREATE,
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.CREATE,
    });
    permission.roles = permission.roles.filter((role) => role !== ROLES.SUPERVISOR);
    await permission.save();

    permission = await PermissionModel.findOne({
      code: PERMISSION_CODES.USER_HISTORY_READ,
      resource: PERMISSION_RESOURCES.USER_HISTORY,
      action: PERMISSION_ACTIONS.READ,
    });
    permission.roles = permission.roles.filter((role) => role !== ROLES.SUPERVISOR);
    await permission.save();

    permission = await PermissionModel.findOne({
      code: PERMISSION_CODES.USER_NOTIFICATIONS_READ,
      resource: PERMISSION_RESOURCES.USER_NOTIFICATIONS,
      action: PERMISSION_ACTIONS.READ,
    });
    permission.roles = permission.roles.filter((role) => role !== ROLES.SUPERVISOR);
    await permission.save();

    await PermissionModel.deleteOne({
      code: PERMISSION_CODES.PATCHES_READ,
      resource: PERMISSION_RESOURCES.PATCH,
      action: PERMISSION_ACTIONS.READ,
    });
  },
};
