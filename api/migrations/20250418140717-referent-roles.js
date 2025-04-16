const { ROLE_JEUNE } = require("snu-lib");
const { ReferentModel } = require("../src/models");
const { RoleModel } = require("../src/models/permissions/role");

module.exports = {
  async up(db, client) {
    // TOO LONG: Run manually
    // await ReferentModel.updateMany({}, [
    //   {
    //     $set: {
    //       roles: {
    //         $filter: {
    //           input: ["$role", "$subRole"],
    //           as: "role",
    //           cond: { $ne: ["$$role", null] },
    //         },
    //       },
    //     },
    //   },
    // ]);

    await RoleModel.create({
      code: ROLE_JEUNE,
      name: "Jeune",
      description: "Jeune sur MonCompte",
      titre: "Jeune sur MonCompte",
      parent: null,
    });
  },

  async down(db, client) {
    await ReferentModel.updateMany({}, { $unset: { roles: 1 } });
  },
};
