const { APPLICATION_STATUS } = require("snu-lib");
const { ApplicationModel } = require("../src/models");
const { notifySupervisorMilitaryPreparationFilesValidated } = require("../src/application/applicationNotificationService");
const { initDB } = require("../src/mongo");
const { logger } = require("../src/logger");

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
  async up() {
    await initDB();
    const applicationsToUpdate = await ApplicationModel.aggregate(aggregation);
    const ids = applicationsToUpdate.map((application) => application._id);
    const updatedApplications = await ApplicationModel.updateMany(
      { _id: { $in: ids } },
      { $set: { status: APPLICATION_STATUS.WAITING_VALIDATION } },
      { fromUser: { firstName: "Migration de synchronisation des candidatures PM" } },
    );
    logger.info(`Migrations de candidatures PM : ${updatedApplications.modifiedCount} candidatures mises à jour`);
    const promises = applicationsToUpdate.map((application) => {
      return notifySupervisorMilitaryPreparationFilesValidated(application);
    });
    await Promise.all(promises);
  },

  async down() {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
