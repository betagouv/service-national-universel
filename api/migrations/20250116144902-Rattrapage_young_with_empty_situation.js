const { logger } = require("../src/logger");
const { YoungModel } = require("../src/models");
module.exports = {
  async up() {
    const youngsWithWrongSituation = await YoungModel.find({ situation: "" });
    logger.info(`Found ${youngsWithWrongSituation.length} youngs with empty situation...`);
    for (const young of youngsWithWrongSituation) {
      await YoungModel.updateOne({ _id: young._id }, { $unset: { situation: "" } });
    }

    const youngsWithWrongGrade = await YoungModel.find({ grade: "" });
    logger.info(`Found ${youngsWithWrongGrade.length} youngs with empty grade...`);
    for (const young of youngsWithWrongGrade) {
      await YoungModel.updateOne({ _id: young._id }, { $unset: { grade: "" } });
    }
  },
};
