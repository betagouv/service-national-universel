const { ClasseModel, YoungModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const classeIds = [
      "668ea393c269e600463e9191",
      "668ea342c269e600463e733c",
      "668ea2c7c269e600463e42d5",
      "668ea33ec269e600463e71f6",
      "668ea34dc269e600463e7781",
      "674583ba3216d9ba70203208",
    ];

    const classes = await ClasseModel.find({ _id: { $in: classeIds } });

    for (const classe of classes) {
      const youngs = await YoungModel.find({ classeId: classe._id });
      for (const young of youngs) {
        young.set({ status: "VALIDATED" });
        await young.save({ fromUser: { firstName: "rattrapage des jeunes CLE désistés" } });
      }
      if (classe._id.toString() === "674583ba3216d9ba70203208") {
        classe.set({ status: "OPEN" });
      } else {
        classe.set({ status: "CLOSED" });
      }
      await classe.save({ fromUser: { firstName: "rattrapage des classes désistés" } });
    }
  },

  async down(db, client) {
    const classeIds = [
      "668ea393c269e600463e9191",
      "668ea342c269e600463e733c",
      "668ea2c7c269e600463e42d5",
      "668ea33ec269e600463e71f6",
      "668ea34dc269e600463e7781",
      "674583ba3216d9ba70203208",
    ];

    const classes = await ClasseModel.find({ _id: { $in: classeIds } });

    for (const classe of classes) {
      const youngs = await YoungModel.find({ classeId: classe._id });
      for (const young of youngs) {
        young.set({ status: "ABANDONED" });
        await young.save({ fromUser: { firstName: "rattrapage des jeunes CLE désistés" } });
      }
      classe.set({ status: "WITHDRAWN" });
      await classe.save({ fromUser: { firstName: "rattrapage des classes désistés" } });
    }
  },
};
