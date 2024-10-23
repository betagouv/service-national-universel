const { CohesionCenterModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const backupCollection = db.collection("deleted_cohesion_centers_backup");

    const cohesionCenterWithoutMatricule = await CohesionCenterModel.find({
      matricule: { $exists: false },
      deletedAt: { $exists: false },
      _id: { $nin: ["664463b918366c00ce334903", "65d48cda74ce010097021ed1"] },
    });

    for (const centre of cohesionCenterWithoutMatricule) {
      await backupCollection.insertOne(centre.toObject());
      centre.deletedAt = new Date();
      await centre.save({ fromUser: { firstName: "SOFTDELETE_CENTERS_WITHOUT_MATRICULE" } });
    }

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },

  async down(db, client) {
    const backupCollection = db.collection("deleted_cohesion_centers_backup");
    const deletedCenters = await backupCollection.find({}).toArray();
    if (deletedCenters.length > 0) {
      for (const centre of deletedCenters) {
        await CohesionCenterModel.create(centre);
      }
    }
    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },
};
