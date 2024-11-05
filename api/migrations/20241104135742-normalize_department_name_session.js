const { SessionPhase1Model } = require("../src/models");
const { departmentLookUp, normalizeDepartmentName } = require("snu-lib");

module.exports = {
  async up(db, client) {
    const backupCollection = db.collection("backup_sessionphase1_department");

    const departmentNames = Object.values(departmentLookUp);

    const nonConformantSessions = await SessionPhase1Model.find({
      department: { $nin: departmentNames },
    });

    for (const session of nonConformantSessions) {
      const originalDepartment = session.department;

      await backupCollection.insertOne(session.toObject());

      session.department = normalizeDepartmentName(originalDepartment);

      await session.save({ fromUser: { firstName: "NORMALIZE_DEPARTMENT" } });
    }

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },

  async down(db, client) {
    const backupCollection = db.collection("backup_sessionphase1_department");
    const backupSessions = await backupCollection.find({}).toArray();

    if (backupSessions.length > 0) {
      for (const backupSession of backupSessions) {
        await SessionPhase1Model.updateOne({ _id: backupSession._id }, { $set: { department: backupSession.department } });
      }
    }

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },
};
