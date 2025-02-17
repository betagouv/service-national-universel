const { SessionPhase1Model } = require("../src/models");

module.exports = {
  async up(db, client) {
    await SessionPhase1Model.find({ sejourSnuId: { $exists: true } })
      .cursor()
      .eachAsync(async (session) => {
        session.sejourSnuIds = [session.sejourSnuId];
        await session.save();
      });
    await SessionPhase1Model.updateMany({ sejourSnuId: { $exists: true } }, { $unset: { sejourSnuId: 1 } });
  },

  async down(db, client) {
    await SessionPhase1Model.find({ sejourSnuIds: { $exists: true } })
      .cursor()
      .eachAsync(async (session) => {
        session.sejourSnuId = session.sejourSnuIds?.[0];
        await session.save();
      });
    await SessionPhase1Model.updateMany({ sejourSnuIds: { $exists: true } }, { $unset: { sejourSnuIds: 1 } });
  },
};
