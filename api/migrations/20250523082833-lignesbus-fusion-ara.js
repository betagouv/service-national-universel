const { LigneBusModel } = require("../src/models");

const cohortName = "2025 HTS 03 - Juin";
const fromUser = { firstName: `Correction de lignes fusionnées ARA cohort ${cohortName}` };

module.exports = {
  async up() {
    const ligneARA638695 = await LigneBusModel.findOne({ busId: "ARA638695", cohort: cohortName });
    ligneARA638695.set({ mergedBusIds: ["ARA638695", "ARA638426"] });
    await ligneARA638695.save({ fromUser });

    const ligneARA638426 = await LigneBusModel.findOne({ busId: "ARA638426", cohort: cohortName });
    ligneARA638426.set({ mergedBusIds: ["ARA638426", "ARA638695"] });
    await ligneARA638426.save({ fromUser });
  },

  async down() {
    const ligneARA638695 = await LigneBusModel.findOne({ busId: "ARA638695", cohort: cohortName });
    ligneARA638695.set({ mergedBusIds: [] });
    await ligneARA638695.save({ fromUser });

    const ligneARA638426 = await LigneBusModel.findOne({ busId: "ARA638426", cohort: cohortName });
    ligneARA638426.set({ mergedBusIds: [] });
    await ligneARA638426.save({ fromUser });
  },
};