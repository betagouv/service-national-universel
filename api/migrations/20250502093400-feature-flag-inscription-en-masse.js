const { FeatureFlagName } = require("snu-lib");
const { FeatureFlagModel } = require("../src/models");

module.exports = {
  async up() {
    await FeatureFlagModel.create({
      description: "Inscription en masse de classe",
      name: FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE,
      enabled: false,
    });
  },

  async down() {
    await FeatureFlagModel.deleteOne({ name: FeatureFlagName.INSCRIPTION_EN_MASSE_CLASSE });
  },
};
