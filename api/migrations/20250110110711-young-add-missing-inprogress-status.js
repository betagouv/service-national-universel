const { addSeconds } = require("date-fns");
const { YoungModel } = require("../src/models");
const { logger } = require("../src/logger");
const { YOUNG_STATUS } = require("snu-lib");

module.exports = {
  async up(db, client) {
    const youngIds = [
      "65b0e166b597340819ebabee",
      "663a26473ae8a97d05740af2",
      "66e08379d2e47db1983812c3",
      "66e418e175ade9d43065e9f0",
      "66e54a6975ade9d4307f7038",
      "66e7e69d75ade9d43098804a",
      "66e803da75ade9d430a0daa6",
      "66e82e2d596f92e9b015a13b",
      "66e8310975ade9d430a326aa",
      "66e83928f842d2d054d24226",
      "66e97d525931aa11e5684a87",
      "66e97fa56695b799258ee2bd",
      "66ebce5eab67a874f48de88f",
      "66ebd02391015e1fa487ea0a",
      "66ebd24a66d7c7e8f2b5cc6b",
      "66ebf50317d273915627fc64",
      "66ebf6bd1816f9ea8e609100",
      "66ebf8bcb2db6289dd91644f",
      "66ebfa8917d2739156285c93",
      "66ebfc4de924f0404449ec4b",
      "66ec0141d013ad665e4cde45",
      "66ec067bbd8d300c529f35ec",
      "66ec07a2b2db6289dd91d12f",
    ];
    const youngs = await YoungModel.find({ _id: { $in: youngIds } });
    for (const young of youngs) {
      const patches = await young.patches.find({ ref: young._id.toString(), "ops.value": YOUNG_STATUS.VALIDATED }).sort({ date: -1 });
      if (patches.length === 0) {
        logger.info(`young ${young._id}: has no VALIDATED patches`);
        continue;
      }
      const validationPatch = patches[0];
      logger.info(`young ${young._id}: ${patches.length} patches, VALIDATED ${validationPatch._id} ${validationPatch.date}`);
      const ops = validationPatch.ops.find(({ value, path }) => path === "/status" && value === YOUNG_STATUS.VALIDATED);

      const patchContent = {
        ref: young._id.toString(),
        ops: [{ ...ops, value: YOUNG_STATUS.IN_PROGRESS, path: "/status" }],
        date: addSeconds(validationPatch.date, -1),
        user: { firstName: "Script rattrapage inscription manuelle" },
        modelName: "young",
      };
      const patchSaved = await young.patches.create(patchContent);
      logger.info(`young ${young._id} new patch created ${patchSaved._id} (${patchSaved.date})`);
    }
  },

  async down(db, client) {},
};
