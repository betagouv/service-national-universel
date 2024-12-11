const { YoungModel } = require("../src/models");

module.exports = {
  async up(db, client) {
    const youngs = await YoungModel.find({ status: "DELETED" });
    for (const young of youngs) {
      young.set({ status: "DELETED" });
      await young.save();
    }
  },
};
