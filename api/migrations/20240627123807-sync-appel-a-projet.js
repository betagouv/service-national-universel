module.exports = {
  async up(db) {
    const syncAppelAProjetFeatureFlag = {
      description: "Endpoint de synchronisation de l'appel à projets CLE 2025-2025",
      name: "SYNC_APPEL_A_PROJET_CLE",
      date: { from: new Date("2024-06-27"), to: new Date("2024-07-31") },
    };
    await db.collection("featureFlags").insertOne(syncAppelAProjetFeatureFlag);
  },
};
