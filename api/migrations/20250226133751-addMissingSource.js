// const { logger } = require("../src/logger");
// const { YoungModel } = require("../src/models");

// module.exports = {
//   async up() {
//     const filter = {
//       email: { $not: /reliquat/i }, // Exclure les emails contenant "reliquat"
//       source: { $exists: false }, // Source inexistante
//       cohort: { $not: /CLE/i }, // Exclure les cohortes contenant "CLE"
//       status: { $ne: "DELETED" }, // Exclure les jeunes supprimés
//     };

//     const update = { $set: { source: "VOLONTAIRE" } };

//     const result = await YoungModel.updateMany(filter, update);

//     logger.info(`${result.modifiedCount} youngs updated: source set to VOLONTAIRE`);
//   },
// };

// const { YoungModel } = require("../src/models");
// const { logger } = require("../src/logger");

// module.exports = {
//   async up() {
//     const cohorts = ["2019", "2020", "2021", "2022", "Octobre 2023 - NC", "Juillet 2023", "Juin 2023", "Avril 2023 - B", "Avril 2023 - A", "Février 2023 - C", "Juillet 2024"];

//     for (const cohort of cohorts) {
//       logger.info(`Processing cohort: ${cohort}`);

//       const cursor = YoungModel.find({
//         email: { $not: /reliquat/i },
//         source: { $exists: false },
//         cohort: cohort,
//       }).cursor();

//       let updatedCount = 0;
//       for await (const user of cursor) {
//         await YoungModel.updateOne({ _id: user._id }, { $set: { source: "VOLONTAIRE" } });
//         updatedCount++;
//       }

//       logger.info(`Updated ${updatedCount} youngs in cohort ${cohort}`);
//     }
//   },
// };

// const { YoungModel } = require("../src/models");
// const { logger } = require("../src/logger");

// module.exports = {
//   async up() {
//     const cohorts = ["2019", "2020", "2021", "2022", "Octobre 2023 - NC", "Juillet 2023", "Juin 2023", "Avril 2023 - B", "Avril 2023 - A", "Février 2023 - C", "Juillet 2024"];

//     for (const cohort of cohorts) {
//       const result = await YoungModel.updateMany(
//         {
//           email: { $not: /reliquat/i },
//           source: { $exists: false },
//           cohort: cohort,
//         },
//         { $set: { source: "VOLONTAIRE" } },
//       );

//       logger.info(`Updated ${result.modifiedCount} youngs in cohort ${cohort}`);
//     }
//   },
// };
