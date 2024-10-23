const { FeatureFlagModel } = require("../src/models");
const { FeatureFlagName } = require("snu-lib");

module.exports = {
  async up() {
    await FeatureFlagModel.updateOne({ name: FeatureFlagName.CLE_IMPORT_CLASSE_COHORT }, { $set: { enabled: true } });
  },

  async down() {
    await FeatureFlagModel.updateOne({ name: FeatureFlagName.CLE_IMPORT_CLASSE_COHORT }, { $set: { enabled: false } });
  },
};
