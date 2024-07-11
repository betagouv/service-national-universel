const ClasseModel = require("../src/models/cle/classe");
const YoungModel = require("../src/models/young");

module.exports = {
  async up(db, client) {
    const emptyClasses = await ClasseModel.find({ schoolYear: "2023-2024", seatsTaken: 0 });

    const emptyClassIds = emptyClasses.map((classe) => classe._id);

    const youngsWithEmptyClasses = await YoungModel.find({ classeId: { $in: emptyClassIds } });

    const classesWithYoungs = youngsWithEmptyClasses.map((young) => young.classeId.toString());

    const classesToDelete = emptyClasses.filter((classe) => !classesWithYoungs.includes(classe._id.toString()));

    if (classesToDelete.length === 0) {
      return;
    }

    const backupCollection = db.collection("deleted_classe_backup");
    await backupCollection.insertMany(classesToDelete);

    await ClasseModel.deleteMany({ _id: { $in: classesToDelete.map((classe) => classe._id) } });

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },

  async down(db, client) {
    const backupCollection = db.collection("deleted_classe_backup");
    const deletedClasses = await backupCollection.find({}).toArray();

    if (deletedClasses.length > 0) {
      await db.collection("classes").insertMany(deletedClasses);
    }

    const backupCount = await backupCollection.countDocuments({});
    if (backupCount === 0) {
      await backupCollection.drop();
    }
  },
};
