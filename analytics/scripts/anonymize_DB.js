(async () => {
  const { Op } = require("sequelize");

  await require("../src/env-manager")();
  const LogYoungModel = require("../src/models/log-youngs.model");

  // get log-youngs from PostgreSQL
  const getLogYoungs = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 30);
    // get only logYoungs after yesterday
    const logYoungs = await LogYoungModel.findAll({
      where: {
        createdAt: {
          [Op.gte]: yesterday,
        },
      },
    });
    console.log("🚀 ~ file: anonymize_DB.js:8 ~ getLogYoungs ~ logYoungs:", logYoungs);
    return logYoungs;
  };

  await getLogYoungs();
  process.exit(0);
})();
