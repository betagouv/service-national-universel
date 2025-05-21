const { ROLES, PERMISSION_ACTIONS, PERMISSION_CODES, ROLES_LIST, PERMISSION_RESOURCES, REFERENT_AND_JEUNE_ROLES_LIST } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    await PermissionModel.create({
      code: PERMISSION_CODES.EXPORT_INJEP,
      titre: "Export INJEP",
      action: PERMISSION_ACTIONS.EXECUTE,
      roles: [ROLES.INJEP, ROLES.ADMIN],
      resource: PERMISSION_RESOURCES.EXPORT_INJEP,
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.PROFILE,
      titre: "Profil",
      action: PERMISSION_ACTIONS.READ,
      roles: ROLES_LIST,
      resource: PERMISSION_RESOURCES.REFERENT,
      policy: {
        where: [
          {
            field: "_id",
            source: "_id",
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.SUPPORT_READ,
      titre: "Voir ses tickets support",
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION],
      resource: PERMISSION_RESOURCES.SUPPORT,
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.SUPPORT_WRITE,
      titre: "Créer un ticket support (Besoin d'aide)",
      action: PERMISSION_ACTIONS.WRITE,
      roles: REFERENT_AND_JEUNE_ROLES_LIST,
      resource: PERMISSION_RESOURCES.SUPPORT,
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.EXPORT_INJEP });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.SUPPORT });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.SUPPORT_WRITE });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.SUPPORT_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.PROFILE });
  },
};
