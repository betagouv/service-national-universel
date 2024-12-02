const { ApplicationModel, YoungModel, MissionModel } = require("../src/models");
const { updateYoungPhase2StatusAndHours, updateYoungStatusPhase2Contract, updateMission } = require("../src/utils");

module.exports = {
  async up(db, client) {
    const backupCollection = db.collection("backup_application_contractstatus");

    const applicationsToUpdate = await ApplicationModel.find({
      contractStatus: "SENT",
      status: "ABANDON",
    });

    for (const application of applicationsToUpdate) {
      const originalApplication = application.toObject();

      await backupCollection.insertOne(originalApplication);

      application.contractStatus = "ABANDON";
      await application.save({ fromUser: { firstName: "MIGRATION_APPLICATION_CONTRACTSTATUS" } });

      // Retrieve the related young and mission documents
      const young = await YoungModel.findById(application.youngId);
      const mission = await MissionModel.findById(application.missionId);

      if (young) {
        await updateYoungPhase2StatusAndHours(young, { user: { firstName: "MIGRATION_APPLICATION_CONTRACTSTATUS" } });
        await updateYoungStatusPhase2Contract(young, { user: { firstName: "MIGRATION_APPLICATION_CONTRACTSTATUS" } });
      }

      if (mission) {
        await updateMission(application, { user: { firstName: "MIGRATION_APPLICATION_CONTRACTSTATUS" } });
      }
    }

    // Drop backup collection if empty
    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },

  async down(db, client) {
    // Restore from backup collection
    const backupCollection = db.collection("backup_application_contractstatus");
    const backupApplications = await backupCollection.find({}).toArray();

    if (backupApplications.length > 0) {
      for (const backupApplication of backupApplications) {
        await ApplicationModel.updateOne({ _id: backupApplication._id }, { $set: { contractStatus: backupApplication.contractStatus } });
      }
    }

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },
};
