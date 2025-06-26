const { LigneBusModel } = require("../src/models");

const cohortName = "2025 HTS 04 - Juillet";
const fromUser = { firstName: `Correction de lignes fusionnées cohort ${cohortName}` };

module.exports = {
  async up() {
    const ligneOCC310342B = await LigneBusModel.findOne({ busId: "OCC310342B", cohort: cohortName });
    ligneOCC310342B.set({ mergedBusIds: ["OCC310342B", "OCC310342"] });
    await ligneOCC310342B.save({ fromUser });

    const ligneOCC310342 = await LigneBusModel.findOne({ busId: "OCC310342", cohort: cohortName });
    ligneOCC310342.set({ mergedBusIds: ["OCC310342", "OCC310342B"] });
    await ligneOCC310342.save({ fromUser });
  },

  async down() {
    const ligneOCC310342B = await LigneBusModel.findOne({ busId: "OCC310342B", cohort: cohortName });
    ligneOCC310342B.set({ mergedBusIds: [] });
    await ligneOCC310342B.save({ fromUser });

    const ligneOCC310342 = await LigneBusModel.findOne({ busId: "OCC310342", cohort: cohortName });
    ligneOCC310342.set({ mergedBusIds: [] });
    await ligneOCC310342.save({ fromUser });
  },
};