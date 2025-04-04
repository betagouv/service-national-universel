const { APPLICATION_STATUS } = require("snu-lib");
const { ApplicationModel } = require("../src/models");
const { notifySupervisorMilitaryPreparationFilesValidated } = require("../src/application/applicationNotificationService");

const aggregation = [
  { $match: { status: APPLICATION_STATUS.WAITING_VERIFICATION } },
  { $addFields: { youngIdToObj: { $toObjectId: "$youngId" } } },
  {
    $lookup: {
      from: "youngs",
      localField: "youngIdToObj",
      foreignField: "_id",
      as: "youngDetails",
    },
  },
  { $unwind: "$youngDetails" },
  { $match: { "youngDetails.statusMilitaryPreparationFiles": "VALIDATED" } },
  { $project: { _id: 1 } },
];

module.exports = {
  async up(db, client) {
    const applicationsToUpdate = await db.aggregate(aggregation).toArray();
    const ids = applicationsToUpdate.map((application) => application._id);
    const updatedApplications = await ApplicationModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: APPLICATION_STATUS.WAITING_VALIDATION } },
      { fromUser: { firstName: "Migration de synchronisation des candidatures PM" } },
    );
    const promises = updatedApplications.map((application) => {
      return notifySupervisorMilitaryPreparationFilesValidated(application);
    });
    await Promise.all(promises);
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
