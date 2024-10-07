// !!! change the path
// process.env["NODE_CONFIG_DIR"] = "/MY_ABSOLUTE_PATH/service-national-universel/api/config/";

const config = require("config");
const { initDB } = require("../../mongo");

(async () => {
  await initDB();
  const { generateYoungsExport } = require("./utils");

  const { CohortModel } = require("../../models");

  const action = "view"; // "upload" or "view"
  const cohortName = "Juillet 2024";

  (async function local() {
    //@todo : update export date in case of upload
    const cohort = await CohortModel.findOne({ name: cohortName });
    await generateYoungsExport(cohort, false, action);
  })();
})();
