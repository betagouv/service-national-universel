const { SessionPhase1Model } = require("../src/models");

module.exports = {
  async up(db, client) {
    const backupCollection = db.collection("backup_sessions_without_placeLeft");

    const sessionsWithoutPlaceLeft = await SessionPhase1Model.find({
      placesLeft: { $exists: false },
    });

    for (const session of sessionsWithoutPlaceLeft) {
      await backupCollection.insertOne(session.toObject());
      session.placesLeft = session.placesTotal;
      await session.save({ fromUser: { firstName: "ADD_PLACELEFT_SESSION" } });
    }

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },

  async down(db, client) {
    const backupCollection = db.collection("backup_sessions_without_placeLeft");
    const backupSessions = await backupCollection.find({}).toArray();

    if (backupSessions.length > 0) {
      for (const backupSession of backupSessions) {
        await SessionPhase1Model.updateOne({ _id: backupSession._id }, { $unset: { placesLeft: 1 } });
      }
    }

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },
};
