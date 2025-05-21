const { logger } = require("../src/logger");
const { YoungModel } = require("../src/models/young");

module.exports = {
  async up() {
    const youngs = await YoungModel.aggregate([
      {
        $match: {
          source: "VOLONTAIRE",
          schooled: "true",
          schoolName: { $exists: false },
          originalCohort: {
            $exists: true,
            $ne: "à venir",
            $not: /CLE/,
          },
          cohort: /HTS/,
        },
      },
      {
        $project: {
          status: 1,
        },
      },
      {
        $lookup: {
          from: "young_patches",
          let: { youngId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  //date du fix d'Eric sur la prod
                  $and: [{ $eq: ["$ref", "$$youngId"] }, { $lt: ["$date", new Date("2024-11-22T00:00:00Z")] }],
                },
              },
            },
            {
              $match: {
                ops: {
                  $elemMatch: {
                    path: "/cohortId",
                    op: "replace",
                  },
                },
              },
            },
            {
              $match: {
                ops: {
                  $elemMatch: {
                    path: "/schoolName",
                    op: "remove",
                  },
                },
              },
            },
          ],
          as: "patches",
        },
      },
    ]);

    logger.info(`Found ${youngs.length} young people with matching patch criteria`);

    // Process results
    for (const young of youngs) {
      logger.info(`Young ID: ${young._id}, Patches: ${young.patches.length}`);
      let schoolName = undefined;
      let schoolId = undefined;
      let schoolType = undefined;
      let schoolAddress = undefined;
      let schoolZip = undefined;
      let schoolCity = undefined;
      let schoolDepartment = undefined;
      let schoolRegion = undefined;
      let schoolCountry = undefined;

      if (young.patches.length > 0) {
        for (const patch of young.patches) {
          schoolName = patch.ops.find((op) => op.path === "/schoolName" && op.op === "remove")?.originalValue;
          schoolId = patch.ops.find((op) => op.path === "/schoolId" && op.op === "remove")?.originalValue;
          schoolType = patch.ops.find((op) => op.path === "/schoolType" && op.op === "remove")?.originalValue;
          schoolAddress = patch.ops.find((op) => op.path === "/schoolAddress" && op.op === "remove")?.originalValue;
          schoolZip = patch.ops.find((op) => op.path === "/schoolZip" && op.op === "remove")?.originalValue;
          schoolCity = patch.ops.find((op) => op.path === "/schoolCity" && op.op === "remove")?.originalValue;
          schoolDepartment = patch.ops.find((op) => op.path === "/schoolDepartment" && op.op === "remove")?.originalValue;
          schoolRegion = patch.ops.find((op) => op.path === "/schoolRegion" && op.op === "remove")?.originalValue;
          schoolCountry = patch.ops.find((op) => op.path === "/schoolCountry" && op.op === "remove")?.originalValue;
        }
        const youngDoc = await YoungModel.findById(young._id);
        if (youngDoc) {
          youngDoc.set({
            schoolId,
            schoolName,
            schoolType,
            schoolAddress,
            schoolZip,
            schoolCity,
            schoolDepartment,
            schoolRegion,
            schoolCountry,
          });
          await youngDoc.save({ fromUser: { firstName: "714 - Rattrappage données scolaires" } });
        }
      } else {
        logger.info(`No patches found for young ID: ${young._id}`);
      }
    }
  },
  async down() {
    // No down migration
  },
};
