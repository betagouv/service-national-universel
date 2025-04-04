const { initDB } = require("../../../db");
const { MissionModel, ApplicationModel } = require("../../../models");
const { MISSION_STATUS, APPLICATION_STATUS } = require("snu-lib");

const fromUser = { firstName: "Script de rattrapage des statuts de missions JVA" };

const query = (originalStatus) => ({
  date: { $gte: new Date("2025-03-19T18:00:00.000Z"), $lte: new Date("2025-03-19T19:00:00.000Z") },
  ops: { $elemMatch: { path: "/status", value: "CANCEL", originalValue: originalStatus } },
  "user.firstName": { $regex: /^cron jeveuxaiderservice\.js$/i },
});

module.exports = {
  async up(db) {
    await initDB();

    const missionPatches = await db.collection("mission_patches").find(query(MISSION_STATUS.VALIDATED)).toArray();
    const missionsToUpdate = await MissionModel.find({
      _id: { $in: missionPatches.map((patch) => patch.ref) },
      status: MISSION_STATUS.WAITING_VALIDATION,
    });
    const missionIds = missionsToUpdate.map((mission) => mission._id);
    const updateMissionsResult = await MissionModel.updateMany({ _id: { $in: missionIds } }, { status: MISSION_STATUS.VALIDATED }, { fromUser });
    console.log("🚀 ~ updateMissionsResult:", updateMissionsResult);

    const applicationPatches = await db.collection("application_patches").find(query(APPLICATION_STATUS.WAITING_VALIDATION)).toArray();
    const applicationsToUpdate = await ApplicationModel.find({
      _id: { $in: applicationPatches.map((patch) => patch.ref) },
      status: APPLICATION_STATUS.CANCEL,
      missionId: { $in: missionIds },
    });
    const applicationIds = applicationsToUpdate.map((application) => application._id);
    const updateApplicationsResult = await ApplicationModel.updateMany(
      { _id: { $in: applicationIds } },
      { status: APPLICATION_STATUS.WAITING_VALIDATION, statusComment: "" },
      { fromUser },
    );
    console.log("🚀 ~ updateApplicationsResult:", updateApplicationsResult);
  },

  async down() {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
