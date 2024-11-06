const { FeatureFlagModel } = require("../src/models");
const { FeatureFlagName } = require("snu-lib");
module.exports = {
  async up() {
    await FeatureFlagModel.create({
      description: "Envoi des invitations aux référents d'une classe dès la vérification",
      name: FeatureFlagName.INVITE_REFERENT_CLASSE_EACH_CLASSE_VERIFIED,
      date: { from: new Date("2024-09-03").toISOString(), to: new Date("2024-10-30").toISOString() },
    });
  },
};
