import { YoungDocument, YoungModel } from "../models";
import { logger } from "../logger";
import { capture } from "../sentry";
import slack from "../slack";

export const handler = async () => {
  try {
    const youngs: (YoungDocument & { patches: any })[] = await YoungModel.aggregate([
      {
        $match: {
          status: "VALIDATED",
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
          localField: "_id",
          foreignField: "ref",
          as: "patches",
        },
      },
    ]);

    const checkMissingInProgressWhenValidated = (youngs: (YoungDocument & { patches: any })[]): string[] => {
      logger.info("checkMissingInProgressWhenValidated.youngs.length : " + youngs.length);
      const youngsWithStatusValidatedWihtoutInProgress: string[] = [];
      let counter = 0;
      for (const young of youngs) {
        counter++;
        if (counter % 1000 === 0) {
          logger.info("checkMissingInProgressWhenValidated.counter : " + counter);
        }
        let hasStatusValidated = false;
        let hasStatusInProgress = false;

        for (const patch of young.patches) {
          for (const op of patch.ops) {
            if (op.path === "/status" && op.value === "VALIDATED") {
              hasStatusValidated = true;
            }
            if (op.path === "/status" && op.value === "IN_PROGRESS") {
              hasStatusInProgress = true;
            }
          }
        }

        if (hasStatusValidated === true && hasStatusInProgress === false) {
          youngsWithStatusValidatedWihtoutInProgress.push(young._id);
        }
      }

      return youngsWithStatusValidatedWihtoutInProgress;
    };

    const youngsWithStatusValidatedWihtoutInProgress = checkMissingInProgressWhenValidated(youngs);

    if (youngsWithStatusValidatedWihtoutInProgress.length > 0) {
      logger.info("checkMissingInProgress: Youngs with status VALIDATED without IN_PROGRESS: " + youngsWithStatusValidatedWihtoutInProgress.length);
      logger.info("checkMissingInProgress: Youngs with status VALIDATED without IN_PROGRESS: " + JSON.stringify(youngsWithStatusValidatedWihtoutInProgress));
      await slack.error({
        title: "checkMissingInProgress",
        text: `Young with incoherent cohortId: ${youngsWithStatusValidatedWihtoutInProgress.length}, cohorts: ${JSON.stringify(youngsWithStatusValidatedWihtoutInProgress)}`,
      });
    } else {
      logger.debug("checkMissingInProgress: No youngs with incoherent cohortId");
    }
  } catch (e) {
    capture(e);
    slack.error({ title: "checkMissingInProgress", text: JSON.stringify(e) });
    throw e;
  }
};
