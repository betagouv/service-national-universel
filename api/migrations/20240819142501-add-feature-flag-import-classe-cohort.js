const { FeatureFlagModel } = require("../src/models");
const { FeatureFlagName } = require("snu-lib");
module.exports = {
  async up() {
    await FeatureFlagModel.create({
      description: "Import des classes et des cohortes",
      name: FeatureFlagName.CLE_IMPORT_CLASSE_COHORT,
      date: { from: new Date("2024-08-30").toISOString(), to: new Date("2024-09-30").toISOString() },
    });
  },
};
