const { featureFlagDocumentModel } = require("../src/models/featureFlag");
module.exports = {
  async up() {
    const CLEBeforeJuly_15_FeatureFlag = {
      description: "Empecher l'affichage des nouvelles classes et etablissement avant le 15 juillet",
      name: "CLE_BEFORE_JULY_15",
      enabled: true,
      date: { from: new Date("2024-07-10").toISOString(), to: new Date("2024-07-15").toISOString() },
    };
    await featureFlagDocumentModel.create(CLEBeforeJuly_15_FeatureFlag);
  },
};
