const { PermissionModel } = require("../src/models/permissions/permission");
const { PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLES, PERMISSION_CODES, PERMISSION_CODES_LIST } = require("snu-lib");
module.exports = {
  async up(db, client) {
    // Mission
    await PermissionModel.create({
      code: PERMISSION_CODES.MISSION_FULL,
      titre: "Accès total sur les missions",
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.MISSION_READ,
      titre: "Accès complet aux missions de la même structure",
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.MISSION_SAME_STRUCTURE_FULL,
      titre: "Accès complet aux missions de la même structure",
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
      policy: {
        where: [
          {
            field: "_id", // structure
            source: "structureId", // referent
          },
        ],
      },
    });
    // Structure
    await PermissionModel.create({
      code: PERMISSION_CODES.STRUCTURE_FULL,
      titre: "Accès complet sur les structures",
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.STRUCTURE_FULL,
      titre: "Accès complet sur les structures de sa région",
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.REFERENT_REGION],
      policy: {
        where: [
          {
            field: "region",
            value: "region",
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.STRUCTURE_FULL,
      titre: "Accès complet sur les structures de son département",
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.REFERENT_DEPARTMENT],
      policy: {
        where: [
          {
            field: "department",
            value: "department",
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.STRUCTURE_FULL,
      titre: "Accès complet sur les structures de son réseau (tête de réseau)",
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.SUPERVISOR],
      policy: {
        where: [
          {
            field: "networkId", // structure
            value: "structureId", // referent
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.STRUCTURE_SAME_STRUCTURE_FULL,
      titre: "Accès complet sur sa structure",
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.RESPONSIBLE],
      policy: {
        where: [
          {
            field: "_id", // structure
            source: "structureId", // referent
          },
        ],
      },
    });
    // Young
    await PermissionModel.create({
      code: PERMISSION_CODES.YOUNG_FULL,
      titre: "Accès complet sur les volontaires",
      resource: PERMISSION_RESOURCES.YOUNG,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.YOUNG_SAME_STRUCTURE_READ,
      titre: "Lecture sur les volontaires de la même structure",
      resource: PERMISSION_RESOURCES.YOUNG,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
      policy: {
        where: [
          {
            field: "_id", // structure
            source: "structureId", // referent
          },
        ],
      },
    });
    // User
    await PermissionModel.create({
      code: PERMISSION_CODES.USER_FULL,
      titre: "Accès complet sur les utilisateurs",
      resource: PERMISSION_RESOURCES.REFERENT,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.USER_SAME_STRUCTURE_FULL,
      titre: "Accès complet sur les utilisateurs de la même structure",
      resource: PERMISSION_RESOURCES.REFERENT,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.SUPERVISOR],
      policy: {
        where: [
          {
            field: "_id", // structure
            source: "structureId", // referent
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.USER_SAME_STRUCTURE_CREATE,
      titre: "Création d'un utilisateur dans la même structure",
      resource: PERMISSION_RESOURCES.REFERENT,
      action: PERMISSION_ACTIONS.CREATE,
      roles: [ROLES.RESPONSIBLE],
      policy: {
        where: [
          {
            field: "_id", // structure
            source: "structureId", // referent
          },
        ],
      },
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.MISSION_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.MISSION_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.MISSION_SAME_STRUCTURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.STRUCTURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.STRUCTURE_SAME_STRUCTURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.YOUNG_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.YOUNG_SAME_STRUCTURE_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_SAME_STRUCTURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_SAME_STRUCTURE_CREATE });
  },
};
