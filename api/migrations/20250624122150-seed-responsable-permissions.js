const { PermissionModel } = require("../src/models/permissions/permission");
const { PERMISSION_RESOURCES, PERMISSION_ACTIONS, ROLES, PERMISSION_CODES, ROLE_JEUNE, SUB_ROLE_GOD, ROLES_LIST, PERMISSION_ACTIONS_READ_WRITE } = require("snu-lib");

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
      titre: "Lecture sur les missions",
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.SUPERVISOR, ROLE_JEUNE],
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
            resource: "structure",
            field: "_id", // structure
            source: "structureId", // referent
          },
          {
            field: "structureId", // mission
            source: "structureId", // referent
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.MISSION_SAME_STRUCTURE_FULL_NETWORK,
      titre: "Accès complet aux missions de la même structure ou de son réseau (superviseur)",
      resource: PERMISSION_RESOURCES.MISSION,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.SUPERVISOR],
      policy: {
        where: [
          // mission de sa structure
          {
            field: "structureId", // mission
            source: "structureId", // referent
          },
          // mission de la structure de son réseau
          {
            resource: "structure",
            field: "networkId", // structure
            source: "structureId", // referent
          },
        ],
      },
    });
    // Contrats
    await PermissionModel.create({
      code: PERMISSION_CODES.CONTRACT_READ,
      titre: "Accès en lecture sur les contrats",
      resource: PERMISSION_RESOURCES.CONTRACT,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLE_JEUNE],
      policy: {
        where: [
          {
            field: "youngId", // contract
            source: "_id", // young
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.CONTRACT_FULL,
      titre: "Accès complet sur les contrats",
      resource: PERMISSION_RESOURCES.CONTRACT,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.RESPONSIBLE, ROLES.SUPERVISOR],
    });
    // Structure
    await PermissionModel.create({
      code: PERMISSION_CODES.STRUCTURE_FULL,
      titre: "Accès complet sur les structures",
      resource: PERMISSION_RESOURCES.STRUCTURE,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN],
    });
    for (const action of PERMISSION_ACTIONS_READ_WRITE) {
      await PermissionModel.create({
        code: PERMISSION_CODES.STRUCTURE_REGION + action,
        titre: "Accès complet sur les structures de sa région",
        resource: PERMISSION_RESOURCES.STRUCTURE,
        action,
        roles: [ROLES.REFERENT_REGION],
        policy: {
          where: [
            {
              field: "region",
              source: "region",
            },
          ],
        },
      });
      await PermissionModel.create({
        code: PERMISSION_CODES.STRUCTURE_DEPARTEMENT + action,
        titre: "Accès complet sur les structures de son département",
        resource: PERMISSION_RESOURCES.STRUCTURE,
        action,
        roles: [ROLES.REFERENT_DEPARTMENT],
        policy: {
          where: [
            {
              field: "department",
              source: "department",
            },
          ],
        },
      });
      await PermissionModel.create({
        code: PERMISSION_CODES.STRUCTURE_TETERESEAU + action,
        titre: "Accès complet sur les structures de son réseau (tête de réseau)",
        resource: PERMISSION_RESOURCES.STRUCTURE,
        action,
        roles: [ROLES.SUPERVISOR],
        policy: {
          where: [
            {
              field: "networkId", // structure
              source: "structureId", // referent
            },
          ],
        },
      });
      await PermissionModel.create({
        code: PERMISSION_CODES.STRUCTURE_SAME_STRUCTURE + action,
        titre: "Accès complet sur sa structure",
        resource: PERMISSION_RESOURCES.STRUCTURE,
        action,
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
    }
    // Young
    await PermissionModel.create({
      code: PERMISSION_CODES.YOUNG_FULL,
      titre: "Accès complet sur les volontaires",
      resource: PERMISSION_RESOURCES.YOUNG,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.YOUNG_CREATE_ETABLISSEMENT,
      titre: "Invitation d'élèves dans son établissement",
      resource: PERMISSION_RESOURCES.YOUNG,
      action: PERMISSION_ACTIONS.CREATE,
      roles: [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
      policy: {
        where: [
          {
            field: "etablissementId", // young
            source: "etablissementId", // referent
          },
        ],
      },
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
    // inscription
    await PermissionModel.create({
      code: PERMISSION_CODES.INSCRIPTION_READ,
      titre: "Accès en lecture sur les inscriptions",
      resource: PERMISSION_RESOURCES.INSCRIPTION,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    });
    // user
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
      roles: [ROLES.SUPERVISOR, ROLES.RESPONSIBLE],
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
      code: PERMISSION_CODES.USER_NOTIFICATIONS_READ,
      titre: "Accès en lecture sur les notifications mail des utilisateurs",
      resource: PERMISSION_RESOURCES.USER_NOTIFICATIONS,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.USER_HISTORY_READ,
      titre: "Accès en lecture sur l'historique des utilisateurs",
      resource: PERMISSION_RESOURCES.USER_HISTORY,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.TRANSPORTER, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    });
    // association
    await PermissionModel.create({
      code: PERMISSION_CODES.ASSOCIATION_READ,
      titre: "Accès en lecture sur les associations",
      resource: PERMISSION_RESOURCES.ASSOCIATION,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT],
    });
    // alerte message
    await PermissionModel.create({
      code: PERMISSION_CODES.ALERTE_MESSAGE_FULL,
      titre: "Accès complet sur les alertes",
      resource: PERMISSION_RESOURCES.ALERTE_MESSAGE,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.ALERTE_MESSAGE_READ,
      titre: "Accès en lecture sur les alertes",
      resource: PERMISSION_RESOURCES.ALERTE_MESSAGE,
      action: PERMISSION_ACTIONS.READ,
      roles: [
        ROLES.ADMIN,
        ROLES.REFERENT_REGION,
        ROLES.REFERENT_DEPARTMENT,
        ROLES.RESPONSIBLE,
        ROLES.HEAD_CENTER,
        ROLES.HEAD_CENTER_ADJOINT,
        ROLES.REFERENT_SANITAIRE,
        ROLES.SUPERVISOR,
        ROLES.REFERENT_CLASSE,
        ROLES.ADMINISTRATEUR_CLE,
      ],
    });
    // cohort
    await PermissionModel.create({
      code: PERMISSION_CODES.SETTINGS_FULL,
      titre: "Accès complet sur les cohortes",
      resource: PERMISSION_RESOURCES.SETTINGS,
      action: PERMISSION_ACTIONS.FULL,
      roles: [SUB_ROLE_GOD],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.SETTINGS_READ,
      titre: "Accès à la gestion des cohortes",
      resource: PERMISSION_RESOURCES.SETTINGS,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.COHORT_READ,
      titre: "Accès en lecture sur les cohortes",
      resource: PERMISSION_RESOURCES.COHORT,
      action: PERMISSION_ACTIONS.READ,
      roles: ROLES_LIST,
    });
    // program
    await PermissionModel.create({
      code: PERMISSION_CODES.PROGRAM_FULL,
      titre: "Accès complet sur les programmes",
      resource: PERMISSION_RESOURCES.PROGRAM,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.ADMIN],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.PROGRAM_FULL_REGION,
      titre: "Accès complet sur les programmes de sa région",
      resource: PERMISSION_RESOURCES.PROGRAM,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.REFERENT_REGION],
      policy: {
        where: [
          {
            field: "region", // program
            source: "region", // referent
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.PROGRAM_FULL_DEPARTMENT,
      titre: "Accès complet sur les programmes de son département",
      resource: PERMISSION_RESOURCES.PROGRAM,
      action: PERMISSION_ACTIONS.FULL,
      roles: [ROLES.REFERENT_DEPARTMENT],
      policy: {
        where: [
          {
            field: "department", // program
            source: "department", // referent
          },
        ],
      },
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.PROGRAM_READ,
      titre: "Accès en lecture sur les programmes",
      resource: PERMISSION_RESOURCES.PROGRAM,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.HEAD_CENTER, ROLES.HEAD_CENTER_ADJOINT, ROLES.REFERENT_SANITAIRE],
    });
    // etablissement
    await PermissionModel.create({
      code: PERMISSION_CODES.ETABLISSEMENT_READ,
      titre: "Accès en lecture sur les établissements",
      resource: PERMISSION_RESOURCES.ETABLISSEMENT,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    });
    // point-de-rassemblement
    await PermissionModel.create({
      code: PERMISSION_CODES.POINT_DE_RASSEMBLEMENT_READ,
      titre: "Accès en lecture sur les points de rassemblement",
      resource: PERMISSION_RESOURCES.POINT_DE_RASSEMBLEMENT,
      action: PERMISSION_ACTIONS.READ,
      roles: [
        ROLES.ADMIN,
        ROLES.REFERENT_REGION,
        ROLES.REFERENT_DEPARTMENT,
        ROLES.HEAD_CENTER,
        ROLES.HEAD_CENTER_ADJOINT,
        ROLES.REFERENT_SANITAIRE,
        ROLES.TRANSPORTER,
        ROLES.ADMINISTRATEUR_CLE,
        ROLES.REFERENT_CLASSE,
      ],
    });
    // ligne-de-bus
    await PermissionModel.create({
      code: PERMISSION_CODES.LIGNE_BUS_FULL,
      titre: "Accès complet sur les lignes de bus",
      resource: PERMISSION_RESOURCES.LIGNE_BUS,
      action: PERMISSION_ACTIONS.FULL,
      roles: [SUB_ROLE_GOD],
    });
    await PermissionModel.create({
      code: PERMISSION_CODES.LIGNE_BUS_READ,
      titre: "Accès en lecture sur les lignes de bus",
      resource: PERMISSION_RESOURCES.LIGNE_BUS,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER],
    });
    // centre
    await PermissionModel.create({
      code: PERMISSION_CODES.COHESION_CENTER_READ,
      titre: "Accès en lecture sur les centres de cohésion",
      resource: PERMISSION_RESOURCES.COHESION_CENTER,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.TRANSPORTER],
    });
    // accueil
    await PermissionModel.create({
      code: PERMISSION_CODES.ACCUEIL_READ,
      titre: "Accès en lecture sur l'accueil",
      resource: PERMISSION_RESOURCES.ACCUEIL,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE],
    });
    // import si snu
    await PermissionModel.create({
      code: PERMISSION_CODES.IMPORT_SI_SNU_FULL,
      titre: "Accès complet aux import SI SNU",
      resource: PERMISSION_RESOURCES.IMPORT_SI_SNU,
      action: PERMISSION_ACTIONS.FULL,
      roles: [SUB_ROLE_GOD],
    });
    // table de repartition
    await PermissionModel.create({
      code: PERMISSION_CODES.TABLE_DE_REPARTITION_READ,
      titre: "Accès en lecture sur la table de repartition",
      resource: PERMISSION_RESOURCES.TABLE_DE_REPARTITION,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT],
    });
    // classe
    await PermissionModel.create({
      code: PERMISSION_CODES.CLASSE_READ,
      titre: "Accès en lecture sur les classes",
      resource: PERMISSION_RESOURCES.CLASSE,
      action: PERMISSION_ACTIONS.READ,
      roles: [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE, ROLES.TRANSPORTER],
    });
  },

  async down(db, client) {
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.MISSION_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.MISSION_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.MISSION_SAME_STRUCTURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.MISSION_SAME_STRUCTURE_FULL_NETWORK });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.STRUCTURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.STRUCTURE_REGION_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.STRUCTURE_SAME_STRUCTURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.YOUNG_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.YOUNG_SAME_STRUCTURE_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_SAME_STRUCTURE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_SAME_STRUCTURE_CREATE });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_NOTIFICATIONS_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.USER_HISTORY_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.CONTRACT_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.CONTRACT_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.ASSOCIATION_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.ALERTE_MESSAGE_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.ALERTE_MESSAGE_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.SETTINGS_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.SETTINGS_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.COHORT_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.PROGRAM_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.PROGRAM_FULL_REGION });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.PROGRAM_FULL_DEPARTMENT });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.PROGRAM_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.ETABLISSEMENT_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.POINT_DE_RASSEMBLEMENT_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.LIGNE_BUS_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.SETTINGS_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.COHESION_CENTER_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.TABLE_DE_REPARTITION_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.ACCUEIL_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.IMPORT_SI_SNU_FULL });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.CLASSE_READ });
    await PermissionModel.deleteOne({ code: PERMISSION_CODES.LIGNE_BUS_FULL });
  },
};
