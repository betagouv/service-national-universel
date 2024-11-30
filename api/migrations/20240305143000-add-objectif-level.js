module.exports = {
  async up(db) {
    await db.collection("cohorts").updateMany({ objectifLevel: null }, { $set: { objectifLevel: "departemental" } });
  },
};
