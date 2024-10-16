const { logger } = require("../src/logger");
const { YoungModel } = require("../src/models");

module.exports = {
  async up() {
    const missingCohortIds = await YoungModel.aggregate([
      {
        $lookup: {
          as: "cohortByName",
          from: "cohorts",
          foreignField: "name",
          localField: "cohort",
        },
      },
      {
        $unwind: "$cohortByName",
      },
      {
        $addFields: {
          cohortByNameId: "$cohortByName._id",
        },
      },
      {
        $match: {
          cohortId: { $exists: false },
        },
      },
      {
        $project: {
          _id: 1,
          cohortId: 1,
          cohort: 1,
          cohortByNameId: 1,
        },
      },
    ]);
    logger.info(`Young with no cohortId: ${missingCohortIds.length}`);
    for (const missingCohortYoung of missingCohortIds) {
      logger.info(`Update young: ${missingCohortYoung._id}, ${missingCohortYoung.cohortByNameId}`);
      await YoungModel.updateOne({ _id: missingCohortYoung._id }, { $set: { cohortId: missingCohortYoung.cohortByNameId } });
    }

    const cohortIncoherences = await YoungModel.aggregate([
      {
        $addFields: {
          convertedId: {
            $toObjectId: "$cohortId",
          },
        },
      },
      {
        $lookup: {
          as: "cohortByName",
          from: "cohorts",
          foreignField: "name",
          localField: "cohort",
        },
      },
      {
        $unwind: "$cohortByName",
      },
      {
        $addFields: {
          cohortByNameId: "$cohortByName._id",
        },
      },
      {
        $match: {
          cohortId: { $exists: true },
          $expr: { $ne: ["$convertedId", "$cohortByNameId"] },
        },
      },
      {
        $project: {
          _id: 1,
          cohortId: 1,
          cohort: 1,
          convertedId: 1,
          cohortByNameId: 1,
        },
      },
    ]);
    logger.info(`Young with incohorent cohortId: ${cohortIncoherences.length}`);
    const youngsByCohort = cohortIncoherences.reduce((acc, cur) => {
      const key = cur.cohortByNameId;
      const youngs = acc[key] || [];
      acc[key] = [...youngs, cur._id];
      return acc;
    }, {});
    for (const cohortId of Object.keys(youngsByCohort)) {
      logger.info(`Update youngs: ${cohortId}, ${youngsByCohort[cohortId]}`);
      await YoungModel.updateMany({ _id: { $in: youngsByCohort[cohortId] } }, { $set: { cohortId: cohortId } });
    }
  },

  async down(db, client) {},
};
