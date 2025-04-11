import { logger } from "../logger";
import { capture } from "../sentry";
import slack from "../slack";
import { YoungModel } from "../models";

export const handler = async () => {
  try {
    const youngWithIncoherence = await YoungModel.aggregate([
      {
        $match: {
          classeId: { $exists: true },
          status: { $ne: "DELETED" },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "classeId",
          foreignField: "_id",
          as: "classeData",
        },
      },
      {
        $unwind: {
          path: "$classeData",
          preserveNullAndEmptyArrays: true, // Keep young without matching classe
        },
      },
      {
        $match: {
          classeData: { $exists: true },
          $expr: { $ne: ["$cohortId", "$classeData.cohortId"] },
        },
      },
      {
        $group: {
          _id: "$cohortId",
          count: { $sum: 1 },
          youngIds: { $push: "$_id" },
        },
      },
      {
        $project: {
          _id: 0,
          cohortId: "$_id",
          count: 1,
          youngIds: 1,
        },
      },
    ]);

    if (youngWithIncoherence.length > 0) {
      const totalIncoherentYoungs = youngWithIncoherence.reduce((sum, group) => sum + group.count, 0);

      const cohortCounts = youngWithIncoherence.reduce((acc, group) => {
        acc[group.cohortId || "unknown"] = group.count;
        return acc;
      }, {});

      logger.info(`Young with incoherent classeId/cohortId: ${totalIncoherentYoungs}, cohorts: ${JSON.stringify(cohortCounts)}`);

      await slack.error({
        title: "CheckClasseCoherence",
        text: `Young with incoherent classeId/cohortId: ${totalIncoherentYoungs}, cohorts: ${JSON.stringify(cohortCounts)}`,
      });
    } else {
      logger.debug("CheckCoherence: No youngs with incoherent classeId/cohortId");
    }
  } catch (e) {
    capture(e);
    await slack.error({ title: "CheckCoherence", text: JSON.stringify(e) });
    throw e;
  }
};
