const { YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const inscriptionStep = await YoungModel.updateMany(
      {
        inscriptionStep2023: "WAITING_CONSENT",
        parentAllowSNU: "true",
        $or: [{ parent1AllowSNU: "true" }, { parent2AllowSNU: "true" }],
      },
      {
        $set: { inscriptionStep2023: "DONE" },
      },
    );
    const reinscriptionStep2023 = await YoungModel.updateMany(
      {
        reinscriptionStep2023: "WAITING_CONSENT",
        parentAllowSNU: "true",
        $or: [{ parent1AllowSNU: "true" }, { parent2AllowSNU: "true" }],
      },
      {
        $set: { reinscriptionStep2023: "DONE" },
      },
    );
  },
};
