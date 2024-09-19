const { addSeconds } = require("date-fns");
const { YoungModel } = require("../src/models");
const { logger } = require("../src/logger");
const { YOUNG_STATUS } = require("snu-lib");

module.exports = {
  async up(db, client) {
    const youngIds = ["66e290cfd2e47db198691be3"]; // TODO: use good ids
    const youngs = await YoungModel.find({ _id: { $in: youngIds } });
    for (const young of youngs) {
      const patches = await young.patches.find({ ref: young._id.toString(), "ops.value": YOUNG_STATUS.VALIDATED }).sort({ date: -1 });
      const validationPatch = patches[0];
      logger.info(`young ${young._id}: ${patches.length} patches, VALIDATED ${validationPatch._id} ${validationPatch.date}`);
      const ops = validationPatch.ops.find(({ value, path }) => path === "/status" && value === "VALIDATED");

      const patchContent = {
        ref: young._id.toString(),
        ops: [{ ...ops, value: "IN_PROGRESS", path: "/status" }],
        date: addSeconds(validationPatch.date, -1),
        user: { firstName: "Script rattrapprage inscription manuelle" },
        modelName: "young",
      };
      throw new Error("Not Implemented Yet");
      const patchSaved = await young.patches.create(patchContent);
      logger.info(`young ${young._id} new patch created ${patchSaved._id} (${patchSaved.date})`);
    }
  },
};
