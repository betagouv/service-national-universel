const { ClasseModel, YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const emptyClasses = await ClasseModel.find({ schoolYear: "2023-2024", seatsTaken: 0 });

    const emptyClassIds = emptyClasses.map((classe) => classe._id);

    const youngsWithEmptyClasses = await YoungModel.find({ classeId: { $in: emptyClassIds } });

    const classesWithYoungs = youngsWithEmptyClasses.map((young) => young.classeId.toString());

    const classesToDelete = emptyClasses.filter((classe) => !classesWithYoungs.includes(classe._id.toString()));

    if (classesToDelete.length > 0) {
      const now = new Date();
      await ClasseModel.updateMany({ _id: { $in: classesToDelete.map((classe) => classe._id) } }, { $set: { deletedAt: now } });
    }
  },
};
