const { LigneBusModel } = require("../src/models");
const { logger } = require("../src/logger");

module.exports = {
  async up() {
    // HDF590023B <=> HDF590023B
    const ligneHDF590023B = await LigneBusModel.findOne({ busId: "HDF590023B", cohort: "2025 CLE 10 - Mars" });
    ligneHDF590023B.set({ mergedBusIds: ["HDF590023B", "HDF597598"] });
    logger.info(`Fusion - 463 - "HDF590023B" will be merged with: "HDF597598"`);
    await ligneHDF590023B.save();

    const ligneHDF597598 = await LigneBusModel.findOne({ busId: "HDF597598", cohort: "2025 CLE 10 - Mars" });
    ligneHDF597598.set({ mergedBusIds: ["HDF597598", "HDF590023B"] });
    logger.info(`Fusion - 463 - "HDF597598" will be merged with: "HDF590023B"`);
    await ligneHDF597598.save();

    // HDF591023 <=> HDF622598B
    const ligneHDF591023 = await LigneBusModel.findOne({ busId: "HDF591023", cohort: "2025 CLE 10 - Mars" });
    ligneHDF591023.set({ mergedBusIds: ["HDF591023", "HDF622598B"] });
    logger.info(`Fusion - 463 - "HDF591023" will be merged with: "HDF622598B"`);
    await ligneHDF591023.save();

    const ligneHDF622598B = await LigneBusModel.findOne({ busId: "HDF622598B", cohort: "2025 CLE 10 - Mars" });
    ligneHDF622598B.set({ mergedBusIds: ["HDF622598B", "HDF591023"] });
    logger.info(`Fusion - 463 - "HDF622598B" will be merged with: "HDF591023"`);
    await ligneHDF622598B.save();
  },

  async down() {
    // Remove merges for HDF590023B and HDF597598
    const ligneHDF590023B = await LigneBusModel.findOne({ busId: "HDF590023B", cohort: "2025 CLE 10 - Mars" });
    ligneHDF590023B.set({ mergedBusIds: ["HDF590023B", "HDF591023"] });
    await ligneHDF590023B.save();

    const ligneHDF597598 = await LigneBusModel.findOne({ busId: "HDF597598", cohort: "2025 CLE 10 - Mars" });
    ligneHDF597598.set({ mergedBusIds: ["HDF597598", "HDF622598B"] });
    await ligneHDF597598.save();

    // Remove merges for HDF591023 and HDF622598B
    const ligneHDF591023 = await LigneBusModel.findOne({ busId: "HDF591023", cohort: "2025 CLE 10 - Mars" });
    ligneHDF591023.set({ mergedBusIds: ["HDF591023", "HDF590023B"] });
    await ligneHDF591023.save();

    const ligneHDF622598B = LigneBusModel.findOne({ busId: "HDF622598B", cohort: "2025 CLE 10 - Mars" });
    ligneHDF622598B.set({ mergedBusIds: ["HDF622598B", "HDF597598"] });
    await ligneHDF622598B.save();
  },
};
