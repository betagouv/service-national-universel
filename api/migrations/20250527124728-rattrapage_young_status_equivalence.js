const { logger } = require("../src/logger");
const { YoungModel } = require("../src/models/young");

module.exports = {
  async up() {
    const results = await YoungModel.aggregate([
      {
        $match: {
          status_equivalence: { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          _id: 1,
          status_equivalence: 1,
        },
      },
      {
        $addFields: {
          _idString: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "missionequivalences",
          localField: "_idString",
          foreignField: "youngId",
          as: "equivalences",
          pipeline: [
            {
              $project: {
                status: 1,
                createdAt: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          hasEquivalence: { $gt: [{ $size: "$equivalences" }, 0] },
          mostRecentEquivalence: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$equivalences",
                  sortBy: { createdAt: -1 },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          statusMismatch: {
            $and: [{ $ne: ["$mostRecentEquivalence", null] }, { $ne: ["$mostRecentEquivalence.status", "$status_equivalence"] }],
          },
        },
      },
      {
        $project: {
          _id: 1,
          status_equivalence: 1,
          hasEquivalence: 1,
          statusMismatch: 1,
          mostRecentEquivalenceStatus: "$mostRecentEquivalence.status",
        },
      },
    ]);

    logger.info(`Found ${results.length} youngs with equivalence status`);

    let youngWithoutEquivalence = 0;
    let youngWithWrongEquivalenceStatus = 0;
    let totalUpdated = 0;

    const statusGroups = new Map();
    for (const young of results) {
      if (!young.hasEquivalence) {
        youngWithoutEquivalence++;
      } else if (young.statusMismatch) {
        youngWithWrongEquivalenceStatus++;
        const correctStatus = young.mostRecentEquivalenceStatus;
        if (!statusGroups.has(correctStatus)) {
          statusGroups.set(correctStatus, []);
        }
        statusGroups.get(correctStatus).push(young._id);
      }
    }

    for (const [correctStatus, youngIds] of statusGroups) {
      const result = await YoungModel.updateMany(
        { _id: { $in: youngIds } },
        {
          $set: {
            status_equivalence: correctStatus,
            updatedAt: new Date(),
          },
        },
      );
      totalUpdated += result.modifiedCount;
      logger.info(`Updated ${result.modifiedCount}/${youngIds.length} youngs to status: ${correctStatus}`);
    }

    logger.info(`Youngs without equivalence: ${youngWithoutEquivalence}`);
    logger.info(`Youngs with wrong equivalence status: ${youngWithWrongEquivalenceStatus}`);
    logger.info(`Total youngs updated: ${totalUpdated}`);
  },
};
