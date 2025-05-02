const { RoleModel } = require("../src/models/permissions/role");
const { ROLES, SUB_ROLES, SUB_ROLE_GOD, VISITOR_SUBROLES, translate } = require("snu-lib");

module.exports = {
  async up(db, client) {
    const roles = [
      {
        code: ROLES.ADMIN,
        titre: translate(ROLES.ADMIN),
      },
      {
        code: ROLES.REFERENT_DEPARTMENT,
        titre: translate(ROLES.REFERENT_DEPARTMENT),
      },
      {
        code: ROLES.REFERENT_REGION,
        titre: translate(ROLES.REFERENT_REGION),
      },
      {
        code: ROLES.RESPONSIBLE,
        titre: translate(ROLES.RESPONSIBLE),
      },
      {
        code: ROLES.SUPERVISOR,
        titre: translate(ROLES.SUPERVISOR),
      },
      {
        code: ROLES.HEAD_CENTER,
        titre: translate(ROLES.HEAD_CENTER),
      },
      {
        code: ROLES.VISITOR,
        titre: translate(ROLES.VISITOR),
      },
      {
        code: ROLES.DSNJ,
        titre: translate(ROLES.DSNJ),
      },
      {
        code: ROLES.INJEP,
        titre: translate(ROLES.INJEP),
      },
      {
        code: ROLES.TRANSPORTER,
        titre: translate(ROLES.TRANSPORTER),
      },
      {
        code: ROLES.ADMINISTRATEUR_CLE,
        titre: translate(ROLES.ADMINISTRATEUR_CLE),
      },
      {
        code: ROLES.REFERENT_CLASSE,
        titre: translate(ROLES.REFERENT_CLASSE),
      },
      // SUB ROLES
      {
        code: SUB_ROLES.manager_department,
        parent: ROLES.REFERENT_DEPARTMENT,
        titre: translate(SUB_ROLES.manager_department),
      },
      {
        code: SUB_ROLES.assistant_manager_department,
        parent: ROLES.REFERENT_DEPARTMENT,
        titre: translate(SUB_ROLES.assistant_manager_department),
      },
      {
        code: SUB_ROLES.manager_phase2,
        parent: ROLES.REFERENT_DEPARTMENT,
        titre: translate(SUB_ROLES.manager_phase2),
      },
      {
        code: SUB_ROLES.secretariat,
        parent: ROLES.REFERENT_DEPARTMENT,
        titre: translate(SUB_ROLES.secretariat),
      },
      {
        code: SUB_ROLES.coordinator,
        parent: ROLES.REFERENT_REGION,
        titre: translate(SUB_ROLES.coordinator),
      },
      {
        code: SUB_ROLES.assistant_coordinator,
        parent: ROLES.REFERENT_REGION,
        titre: translate(SUB_ROLES.assistant_coordinator),
      },
      {
        code: SUB_ROLES.referent_etablissement,
        parent: ROLES.ADMINISTRATEUR_CLE,
        titre: translate(SUB_ROLES.referent_etablissement),
      },
      {
        code: SUB_ROLES.coordinateur_cle,
        parent: ROLES.ADMINISTRATEUR_CLE,
        titre: translate(SUB_ROLES.coordinateur_cle),
      },
      // SUB ROLE ADMIN
      {
        code: SUB_ROLE_GOD,
        parent: ROLES.ADMIN,
        titre: translate(SUB_ROLE_GOD),
      },
      // VISITOR SUBROLES
      {
        code: VISITOR_SUBROLES.recteur_region,
        parent: ROLES.VISITOR,
        titre: translate(VISITOR_SUBROLES.recteur_region),
      },
      {
        code: VISITOR_SUBROLES.recteur,
        parent: ROLES.VISITOR,
        titre: translate(VISITOR_SUBROLES.recteur),
      },
      {
        code: VISITOR_SUBROLES.vice_recteur,
        parent: ROLES.VISITOR,
        titre: translate(VISITOR_SUBROLES.vice_recteur),
      },
      {
        code: VISITOR_SUBROLES.dasen,
        parent: ROLES.VISITOR,
        titre: translate(VISITOR_SUBROLES.dasen),
      },
      {
        code: VISITOR_SUBROLES.sgra,
        parent: ROLES.VISITOR,
        titre: translate(VISITOR_SUBROLES.sgra),
      },
      {
        code: VISITOR_SUBROLES.sga,
        parent: ROLES.VISITOR,
        titre: translate(VISITOR_SUBROLES.sga),
      },
      {
        code: VISITOR_SUBROLES.drajes,
        parent: ROLES.VISITOR,
        titre: translate(VISITOR_SUBROLES.drajes),
      },
      {
        code: VISITOR_SUBROLES.other,
        parent: ROLES.VISITOR,
        titre: translate(VISITOR_SUBROLES.other),
      },
    ];
    await RoleModel.insertMany(roles);
  },

  async down(db, client) {
    await RoleModel.deleteMany();
  },
};
