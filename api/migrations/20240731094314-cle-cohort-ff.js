const { FeatureFlagModel } = require("../src/models");
module.exports = {
  async up() {
    const CLECohortEnabled_FeatureFlag = {
      description: "Empecher l'affection d'une cohort lors de la création d'une classe",
      name: "CLE_CLASSE_ADD_COHORT_ENABLED",
      enabled: false,
    };
    await FeatureFlagModel.create(CLECohortEnabled_FeatureFlag);
  },
};
