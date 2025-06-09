import { logger } from "../logger";
import { ReferentModel } from "../models";

export const handler = async () => {
  try {
    const referents = await ReferentModel.find({
      roles: {
        $exists: true,
        $elemMatch: { $eq: null },
      },
    });
    logger.info(`Found ${referents.length} referents with null roles`);

    const result = await ReferentModel.updateMany({ roles: { $exists: true, $elemMatch: { $eq: null } } }, { $pull: { roles: null } });
    logger.info(`Updated ${result.modifiedCount} referents by removing null roles`);
  } catch (e) {
    logger.error("Error in cron job to find referents with null roles", e);
    throw e;
  }
};
