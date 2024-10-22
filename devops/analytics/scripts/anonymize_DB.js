(async () => {
  try {
    const { Op } = require("sequelize");
    await require("../src/env-manager")();

    const modelMongo = require("../../api/src/models/young");
    const modelPostgres = require("../src/models/log-youngs.model");

    // const modelMongo = require("../../api/src/models/mission");
    // const modelPostgres = require("../src/models/log-missions.model");

    // const modelMongo = require("../../api/src/models/application");
    // const modelPostgres = require("../src/models/log-applications.model");

    // const modelMongo = require("../../api/src/models/structure");
    // const modelPostgres = require("../src/models/log-structures.model");

    // const modelMongo = require("../../api/src/models/missionEquivalence");
    // const modelPostgres = require("../src/models/log-mission-equivalence.model");

    const anonymiseLogs = async () => {
      let currentDay = null;
      const batchSize = 10000; // Define the size of each batch

      const where = {
        date: {
          [Op.gte]: new Date("2022-05-30"),
        },
      };

      const total = await modelPostgres.count({
        where,
      });
      let processed = 0;

      while (processed < total) {
        const logYoungs = await modelPostgres.findAll({
          where,
          order: [["date", "ASC"]],
          attributes: { include: ["raw_data"] },
          offset: processed,
          limit: batchSize,
        });

        const length_batch = logYoungs.length;
        let count = 0;

        await Promise.all(
          logYoungs.map(async (logYoung) => {
            try {
              const logDate = logYoung.date.toISOString().split("T")[0]; // Assuming 'date' is a Date object

              if (logDate !== currentDay) {
                console.log(`Processing entries for ${logDate}`);
                currentDay = logDate;
              }

              if (count % 1000 === 0) console.log(count, "/", length_batch);
              count++;

              const data = logYoung.get({ plain: true });

              const mongoYoung = new modelMongo(data.raw_data).anonymise();

              logYoung.raw_data = mongoYoung;
              await logYoung.save();
              return;
            } catch (error) {
              console.error("Error processing logYoung:", logYoung.id, error);
              // handle error appropriately
            }
          }),
        );

        processed += length_batch;
        console.log(`Processed ${processed}/${total}`);
      }

      console.log("FINISHED !");
    };

    await anonymiseLogs();
    process.exit(0);
  } catch (error) {
    console.error("Error in program :", error);
    process.exit(1);
  }
})();
