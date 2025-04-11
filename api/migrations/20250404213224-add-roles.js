const { ACTIONS, ROLES } = require("snu-lib");
const { RoleModel } = require("../src/models/role");
const { logger } = require("../src/logger");
const { CohortModel } = require("../src/models");

const rolesToInsert = [
  {
    name: ROLES.ADMIN,
    desc: "Modérateur",
    permissions: [
      { name: ACTIONS.TRANSPORT.UPDATE },
      { name: ACTIONS.TRANSPORT.UPDATE_PDR_ID },
      { name: ACTIONS.TRANSPORT.UPDATE_PDR_SCHEDULE },
      { name: ACTIONS.TRANSPORT.UPDATE_TYPE },
      { name: ACTIONS.TRANSPORT.UPDATE_SESSION_ID },
      { name: ACTIONS.TRANSPORT.UPDATE_CENTER_SCHEDULE },
      { name: ACTIONS.TRANSPORT.SEND_NOTIFICATION },

      {
        name: ACTIONS.PHASE_1.POINTAGE,
        conditions: [
          {
            modelName: CohortModel.modelName,
            type: "boolean",
            field: "youngCheckinForAdmin",
          },
        ],
      },

      { name: ACTIONS.CONTRACT.CREATE, value: true },
      { name: ACTIONS.CONTRACT.UPDATE, value: true },
      { name: ACTIONS.CONTRACT.READ, value: true },
    ],
  },
  {
    name: ROLES.TRANSPORTER,
    desc: "Transporteur",
    permissions: [
      {
        name: ACTIONS.TRANSPORT.UPDATE,
        context: { cohort: { boolean: "busEditionOpenForTransporter" } },
      },
      {
        name: ACTIONS.TRANSPORT.UPDATE_PDR_SCHEDULE,
        context: { cohort: { boolean: "busEditionOpenForTransporter" } },
      },
      {
        name: ACTIONS.TRANSPORT.UPDATE_TYPE,
        context: { cohort: { boolean: "busEditionOpenForTransporter" } },
      },
      {
        name: ACTIONS.TRANSPORT.UPDATE_CENTER_SCHEDULE,
        context: { cohort: { boolean: "busEditionOpenForTransporter" } },
      },
    ],
  },
  {
    name: ROLES.HEAD_CENTER,
    desc: "Chef de centre de cohésion",
    permissions: [
      {
        name: ACTIONS.PHASE_1.POINTAGE,
        context: { cohort: { boolean: "youngCheckinForHeadOfCenter" } },
      },
    ],
  },
  {
    name: ROLES.REFERENT_REGION,
    desc: "Référent régional",
    permissions: [
      {
        name: ACTIONS.PHASE_1.POINTAGE,
        context: { cohort: { boolean: "youngCheckinForRegionReferent" } },
      },
    ],
  },
  {
    name: ROLES.REFERENT_DEPARTMENT,
    desc: "Référent départemental",
    permissions: [
      {
        name: ACTIONS.PHASE_1.POINTAGE,
        context: { cohort: { boolean: "youngCheckinForDepartmentReferent" } },
      },
    ],
  },
  {
    name: ROLES.RESPONSIBLE,
    desc: "Responsable de structure",
    permissions: [
      { name: ACTIONS.CONTRACT.CREATE, value: true },
      { name: ACTIONS.CONTRACT.UPDATE, value: true },
      { name: ACTIONS.CONTRACT.READ, value: true },
    ],
  },
  {
    name: ROLES.SUPERVISOR,
    desc: "Superviseur de MIG",
    permissions: [
      { name: ACTIONS.CONTRACT.CREATE, value: true },
      { name: ACTIONS.CONTRACT.UPDATE, value: true },
      { name: ACTIONS.CONTRACT.READ, value: true },
    ],
  },
];

module.exports = {
  async up() {
    const res = await RoleModel.insertMany(rolesToInsert);
    logger.info(`Migration 20250404213224-add-roles : ${res.length} roles created`);
    return res.length;
  },

  async down() {
    // TODO write the statements to rollback your migration (if possible)
    const res = await RoleModel.deleteMany({ name: { $in: rolesToInsert.map((r) => r.name) } });
    logger.info(`Migration 20250404213224-add-roles : ${res.deletedCount} roles deleted`);
    return res.deletedCount;
  },
};
