const { ReferentModel } = require("../src/models");

module.exports = {
  async up() {
    const inOneMonth = new Date();
    inOneMonth.setMonth(inOneMonth.getMonth() + 1);

    await ReferentModel.updateMany(
      {
        role: "referent_classe",
        invitationToken: { $exists: true, $nin: ["", null] },
        "metadata.invitationType": { $exists: true },
      },
      { $set: { invitationExpires: inOneMonth } },
    );
  },
};
