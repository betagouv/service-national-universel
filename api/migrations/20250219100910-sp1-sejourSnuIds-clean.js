const { SessionPhase1Model } = require("../src/models");

module.exports = {
  async up(db, client) {
    // on supprime le champ obsolète
    await db.collection("sessionphase1").updateMany({ sejourSnuId: { $exists: true } }, { $unset: { sejourSnuId: 1 } });

    // on nettoie les valeurs null
    const sejourList = await SessionPhase1Model.find({ sejourSnuIds: { $exists: true } });
    console.log(`Updating ${sejourList.length} sejours`);
    for (const sejour of sejourList) {
      sejour.sejourSnuIds = sejour.sejourSnuIds.filter((id) => !!id);
      await sejour.save();
    }
  },

  async down(db, client) {
    // Cannot revert
  },
};
