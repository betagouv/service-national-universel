const { ClasseModel, YoungModel } = require("../src/models");
const { STATUS_PHASE1_CLASSE, YOUNG_STATUS_PHASE1 } = require("snu-lib");

module.exports = {
  async up(db, client) {
    const classes = await ClasseModel.find({ schoolYear: "2023-2024" });

    const classIds = classes.map((classe) => classe._id);

    const youngsDone = await YoungModel.find({ classeId: { $in: classIds }, statusPhase1: YOUNG_STATUS_PHASE1.DONE });

    const doneClassIds = new Set(youngsDone.map((young) => young.classeId));

    await ClasseModel.updateMany(
      {
        ligneId: { $exists: true },
        _id: { $nin: Array.from(doneClassIds) },
      },
      { $set: { statusPhase1: STATUS_PHASE1_CLASSE.AFFECTED } },
    );
    await ClasseModel.updateMany({ _id: { $in: Array.from(doneClassIds) } }, { $set: { statusPhase1: STATUS_PHASE1_CLASSE.DONE } });
  },

  async down(db, client) {
    await ClasseModel.updateMany({ schoolYear: "2023-2024" }, { $set: { statusPhase1: STATUS_PHASE1_CLASSE.WAITING_AFFECTATION } });
  },
};
