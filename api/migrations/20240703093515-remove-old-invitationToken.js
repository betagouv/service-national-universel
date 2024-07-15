const { ReferentModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    await ReferentModel.updateMany(
      { invitationToken: { $ne: "" }, lastLoginAt: { $exists: true }, role: { $in: ["administrateur_cle", "referent_classe"] } },
      { invitationToken: "" },
    );
  },
};
