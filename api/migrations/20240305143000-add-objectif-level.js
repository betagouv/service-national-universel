const { INSCRIPTION_GOAL_LEVELS } = require("snu-lib");

module.exports = {
  async up(db) {
    await db.collection("cohorts").updateMany({ objectifLevel: null }, { $set: { objectifLevel: INSCRIPTION_GOAL_LEVELS.DEPARTEMENTAL } });
  },
};
