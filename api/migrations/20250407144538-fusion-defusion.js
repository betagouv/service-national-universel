const { LigneBusModel } = require("../src/models");

const cohort = "2025 HTS 03 - Juin";

const fromUser = { firstName: "Correction de lignes fusionnées" };

module.exports = {
  async up() {
    // 1. Fusion BFC250250-BFC250717 à la place de BFC250250-BFC580250
    const ligneBFC250250 = await LigneBusModel.findOne({ busId: "BFC250250", cohort });
    ligneBFC250250.set({ mergedBusIds: ["BFC250250", "BFC250717"] });
    await ligneBFC250250.save({ fromUser });

    const ligneBFC250717 = await LigneBusModel.findOne({ busId: "BFC250717", cohort });
    ligneBFC250717.set({ mergedBusIds: ["BFC250717", "BFC250250"] });
    await ligneBFC250717.save({ fromUser });

    const ligneBFC580250 = await LigneBusModel.findOne({ busId: "BFC580250", cohort });
    ligneBFC580250.set({ mergedBusIds: undefined });
    await ligneBFC580250.save({ fromUser });

    // 2. Fusion BFC710717-BFC710250 à la place de BFC710717-BFC580717
    const ligneBFC710717 = await LigneBusModel.findOne({ busId: "BFC710717", cohort });
    ligneBFC710717.set({ mergedBusIds: ["BFC710717", "BFC710250"] });
    await ligneBFC710717.save({ fromUser });

    const ligneBFC710250 = await LigneBusModel.findOne({ busId: "BFC710250", cohort });
    ligneBFC710250.set({ mergedBusIds: ["BFC710250", "BFC710717"] });
    await ligneBFC710250.save({ fromUser });

    const ligneBFC580717 = await LigneBusModel.findOne({ busId: "BFC580717", cohort });
    ligneBFC580717.set({ mergedBusIds: undefined });
    await ligneBFC580717.save({ fromUser });
  },

  async down() {
    // 1.
    const ligneBFC250250 = await LigneBusModel.findOne({ busId: "BFC250250", cohort });
    ligneBFC250250.set({ mergedBusIds: ["BFC250250", "BFC580250"] });
    await ligneBFC250250.save({ fromUser });

    const ligneBFC580250 = await LigneBusModel.findOne({ busId: "BFC580250", cohort });
    ligneBFC580250.set({ mergedBusIds: ["BFC580250", "BFC250250"] });
    await ligneBFC580250.save({ fromUser });

    const ligneBFC250717 = await LigneBusModel.findOne({ busId: "BFC250717", cohort });
    ligneBFC250717.set({ mergedBusIds: undefined });
    await ligneBFC250717.save({ fromUser });

    // 2.
    const ligneBFC710717 = await LigneBusModel.findOne({ busId: "BFC710717", cohort });
    ligneBFC710717.set({ mergedBusIds: ["BFC710717", "BFC580717"] });
    await ligneBFC710717.save({ fromUser });

    const ligneBFC580717 = await LigneBusModel.findOne({ busId: "BFC580717", cohort });
    ligneBFC580717.set({ mergedBusIds: ["BFC580717", "BFC710717"] });
    await ligneBFC580717.save({ fromUser });

    const ligneBFC710250 = await LigneBusModel.findOne({ busId: "BFC710250", cohort });
    ligneBFC710250.set({ mergedBusIds: undefined });
    await ligneBFC710250.save({ fromUser });
  },
};
