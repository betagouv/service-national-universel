const { PERMISSION_CODES, PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLES, ROLE_JEUNE, PERMISSION_ACTIONS_READ_WRITE_CREATE } = require("snu-lib");
const { PermissionModel } = require("../src/models/permissions/permission");

module.exports = {
  async up(db, client) {
    await PermissionModel.create({
      code: PERMISSION_CODES.CANDIDATURE_FULL,
      titre: "Accès complet sur les candidatures",
      resource: PERMISSION_RESOURCES.APPLICATION,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.CANDIDATURE_READ,
      titre: "Lecture sur les candidatures",
      resource: PERMISSION_RESOURCES.APPLICATION,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.CANDIDATURE_YOUNG_FULL,
      titre: "Accès complet sur ses candidatures",
      resource: PERMISSION_RESOURCES.APPLICATION,
      action: PERMISSION_ACTIONS.FULL,
      policy: {
        where: [
          {
            source: "_id", // user (young)
            field: "youngId", // application
          },
          {
            source: "_id", // user (young)
            resource: "young", // young of application
            field: "_id", // young of application
          },
        ],
      },
      roles: [ROLE_JEUNE],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.CANDIDATURE_WRITE,
      titre: "Modification de candidatures",
      resource: PERMISSION_RESOURCES.APPLICATION,
      action: PERMISSION_ACTIONS.WRITE,
      roles: [ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.CANDIDATURE_CREATE,
      titre: "Création de candidatures",
      resource: PERMISSION_RESOURCES.APPLICATION,
      action: PERMISSION_ACTIONS.CREATE,
      roles: [ROLES.SUPERVISOR, ROLES.RESPONSIBLE, ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE],
    });
    for (const action of PERMISSION_ACTIONS_READ_WRITE_CREATE) {
      await PermissionModel.create({
        code: PERMISSION_CODES.CANDIDATURE_REGION + action,
        titre: "Création de candidatures",
        resource: PERMISSION_RESOURCES.APPLICATION,
        action,
        policy: {
          where: [
            {
              resource: "young",
              field: "region",
              source: "region",
            },
          ],
        },
        roles: [ROLES.REFERENT_REGION],
      });
      await PermissionModel.create({
        code: PERMISSION_CODES.CANDIDATURE_DEPARTMENT + action,
        titre: "Création de candidatures",
        resource: PERMISSION_RESOURCES.APPLICATION,
        action,
        policy: {
          where: [
            {
              resource: "young",
              field: "department",
              source: "department",
            },
          ],
        },
        roles: [ROLES.REFERENT_DEPARTMENT],
      });
      await PermissionModel.create({
        code: PERMISSION_CODES.CANDIDATURE_CLE + action,
        titre: "Lecture sur les candidatures CLE",
        resource: PERMISSION_RESOURCES.APPLICATION,
        action,
        policy: {
          where: [
            {
              resource: "young",
              field: "source", // young
              value: "CLE",
            },
          ],
        },
        roles: [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE],
      });
    }
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.CANDIDATURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.CANDIDATURE_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.CANDIDATURE_YOUNG_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.CANDIDATURE_WRITE });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.CANDIDATURE_CREATE });
    for (const action of PERMISSION_ACTIONS_READ_WRITE_CREATE) {
      await PermissionModel.deleteOne({ code: PERMISSION_CODES.CANDIDATURE_REGION + action });
      await PermissionModel.deleteOne({ code: PERMISSION_CODES.CANDIDATURE_DEPARTMENT + action });
      await PermissionModel.deleteOne({ code: PERMISSION_CODES.CANDIDATURE_CLE + action });
    }
  },
};
