const { ReferentModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    await ReferentModel.updateMany({}, [
      {
        $set: {
          roles: {
            $filter: {
              input: ["$role", "$subRole"],
              as: "role",
              cond: { $ne: ["$$role", null] },
            },
          },
        },
      },
    ]);
  },

  async down(db, client) {
    await ReferentModel.updateMany({}, { $unset: { roles: 1 } });
  },
};
