import { YoungModel } from "../models";
import { logger } from "../logger";
import { capture } from "../sentry";
import slack from "../slack";

export const handler = async () => {
  try {
    // get all young without cohortId
    const youngs = await YoungModel.find({ cohort: { $exists: true }, cohortId: { $exists: false } }).select({ _id: 1, cohort: 1 });

    if (youngs.length > 0) {
      const youngsCountByCohort = youngs.reduce((acc, cur) => {
        acc[cur.cohort!] = (acc[cur.cohort!] || 0) + 1;
        return acc;
      }, {});
      logger.info(`Young without cohortId: ${youngs.length}, cohorts: ${JSON.stringify(youngsCountByCohort)}`);
      await slack.error({
        title: "CheckCoherence",
        text: `Young without cohortId: ${youngs.length}, cohorts: ${JSON.stringify(youngsCountByCohort)}`,
      });
    } else {
      logger.debug("CheckCoherence: No youngs without cohortId");
    }

    // get all young with cohort not corresponding to cohortId
    const cohortIncoherence = (await YoungModel.aggregate([
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
    ]).exec()) as { _id: string; cohortId: string; cohort: string; convertedId: string; cohortByNameId: string }[];
    if (cohortIncoherence.length > 0) {
      const youngsCountByCohort = youngs.reduce((acc, cur) => {
        acc[cur.cohort!] = (acc[cur.cohort!] || 0) + 1;
        return acc;
      }, {});
      logger.info(`Young with incoherent cohortId: ${cohortIncoherence.length}, cohorts: ${JSON.stringify(youngsCountByCohort)}`);
      await slack.error({
        title: "CheckCoherence",
        text: `Young with incoherent cohortId: ${cohortIncoherence.length}, cohorts: ${JSON.stringify(youngsCountByCohort)}`,
      });
    } else {
      logger.debug("CheckCoherence: No youngs with incoherent cohortId");
    }
  } catch (e) {
    capture(e);
    slack.error({ title: "CheckCoherence", text: JSON.stringify(e) });
    throw e;
  }
};
