const { CohortModel } = require("../src/models");
const { logger } = require("../src/logger");

module.exports = {
  async up() {
    const now = new Date();
    const cohorts = await CohortModel.updateMany({ dateEnd: { $gt: now } }, [
      {
        $set: {
          dateEnd: {
            $dateFromParts: {
              year: { $year: "$dateEnd" },
              month: { $month: "$dateEnd" },
              day: { $dayOfMonth: "$dateEnd" },
              hour: 22,
              minute: 0,
              second: 0,
              millisecond: 0,
              timezone: "+00:00",
            },
          },
        },
      },
    ]);
    logger.info(`${cohorts.modifiedCount} cohorts updated`);
  },

  async down() {
    const cohorts = await CohortModel.updateMany(
      {
        $expr: {
          $eq: [{ $hour: "$dateEnd" }, 22],
        },
      },
      [
        {
          $set: {
            dateEnd: {
              $dateFromParts: {
                year: { $year: "$dateEnd" },
                month: { $month: "$dateEnd" },
                day: { $dayOfMonth: "$dateEnd" },
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
                timezone: "+00:00",
              },
            },
          },
        },
      ],
    );
    logger.info(`${cohorts.modifiedCount} cohorts reverted back to midnight`);
  },
};
