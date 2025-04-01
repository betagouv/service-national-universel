const { FeatureFlagModel } = require("../src/models");
module.exports = {
  async up() {
    const FeatureFlag = {
      description: "Permettre de détacher un centre d'une session lors de l'import des centres de sessions (suppression réelle)",
      name: "IMPORT_SISNU_CENTRESESSIONS_DELETE",
      enabled: true,
    };
    await FeatureFlagModel.create(FeatureFlag);
  },
};
