const { FeatureFlagModel } = require("../src/models");
module.exports = {
  async up() {
    const syncAppelAProjetFeatureFlag = {
      description: "Endpoint de synchronisation de l'appel à projets CLE 2024-2025",
      name: "SYNC_APPEL_A_PROJET_CLE",
      date: { from: new Date("2024-06-27").toISOString(), to: new Date("2024-07-31").toISOString() },
    };
    await FeatureFlagModel.create(syncAppelAProjetFeatureFlag);
  },
};
