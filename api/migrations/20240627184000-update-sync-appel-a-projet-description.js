const { FeatureFlagName } = require("../src/models/featureFlagType");
module.exports = {
  async up(db) {
    await db
      .collection("featureFlags")
      .updateOne({ name: FeatureFlagName.SYNC_APPEL_A_PROJET_CLE }, { $set: { description: "Endpoint de synchronisation de l'appel à projets CLE 2024-2025" } });
  },
};
