const { logger } = require("../src/logger");

module.exports = {
  async up(db) {
    const cohorts = [
      "2019",
      "2020",
      "2021",
      "2022",
      "Juillet 2022",
      "Juin 2022",
      "Février 2022",
      "Octobre 2023 - NC",
      "Juillet 2023",
      "Juin 2023",
      "Avril 2023 - B",
      "Avril 2023 - A",
      "Février 2023 - C",
      "Avril 2024 - A",
      "Avril 2024 - B",
      "Avril 2024 - C",
      "Février 2024 - A",
      "Février 2024 - B",
      "Juin 2024 - 2",
      "Juillet 2024",
      "à venir",
    ];

    const filter = {
      email: { $not: /reliquat/i },
      source: { $exists: false },
      status: { $ne: "DELETED" },
      cohort: { $in: cohorts },
    };

    const update = { $set: { source: "VOLONTAIRE" } };

    const result = await db.collection("youngs").updateMany(filter, update);

    logger.info(`Updated ${result.modifiedCount} youngs in cohorts ${cohorts.join(", ")}`);
  },
};
