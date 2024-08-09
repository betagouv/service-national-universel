const { FeatureFlagModel } = require("../src/models");
const { FeatureFlagName } = require("snu-lib");
module.exports = {
  async up() {
    await FeatureFlagModel.create({
      description: "Envoi des invitations des référents de classe",
      name: FeatureFlagName.INVITE_REFERENT_CLASSE,
      date: { from: new Date("2024-09-03").toISOString(), to: new Date("2024-09-30").toISOString() },
    });
  },
};
