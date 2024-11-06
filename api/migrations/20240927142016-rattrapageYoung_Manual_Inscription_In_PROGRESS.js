const { YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const youngs = await YoungModel.find({ source: "CLE", status: "IN_PROGRESS", grade: "", situation: "", parentAllowSNU: "true" });
    for (const young of youngs) {
      young.status = "WAITING_VALIDATION";
      young.situation = "GENERAL_SCHOOL";
      await young.save();
    }
  },

  async down() {
    const youngs = await YoungModel.find({ source: "CLE", status: "WAITING_VALIDATION", grade: "", situation: "GENERAL_SCHOOL", parentAllowSNU: "true" });
    for (const young of youngs) {
      young.status = "IN_PROGRESS";
      young.situation = "";
      await young.save();
    }
  },
};
