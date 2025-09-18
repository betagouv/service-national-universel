const { logger } = require("../src/logger");

module.exports = {
  async up(db, client) {
    const targetDate = new Date("2026-12-31T00:00:00.000Z");

    logger.info("Starting migration: Fix JVA missions endAt dates to 2026-12-31T00:00:00.000Z");

    const missionsToUpdate = await db
      .collection("missions")
      .find({
        endAt: {
          $gte: new Date("2026-12-31T00:00:00.000Z"),
          $lt: new Date("2027-01-01T00:00:00.000Z"),
        },
      })
      .toArray();

    logger.info(`Found ${missionsToUpdate.length} missions to update`);

    if (missionsToUpdate.length > 0) {
      const result = await db.collection("missions").updateMany(
        {
          endAt: {
            $gte: new Date("2026-12-31T00:00:00.000Z"),
            $lt: new Date("2027-01-01T00:00:00.000Z"),
          },
        },
        {
          $set: {
            endAt: targetDate,
          },
        },
      );

      logger.info(`Updated ${result.modifiedCount} missions`);
    }

    logger.info("Migration completed successfully");
  },

  async down(db, client) {},
};
