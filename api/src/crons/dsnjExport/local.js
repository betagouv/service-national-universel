(async () => {
  await require("../../env-manager")();
  const initDB = require("./mongo");
  await initDB();

  // ! To migrate into scripts dir to not be tagged as dead code

  const { generateYoungsExport, generateCohesionCentersExport } = require("./utils");

  const CohortModel = require("../../models/cohort");

  const action = "view"; // "upload" or "view"
  const cohortName = "Juillet 2023";

  (async function local() {
    //@todo : update export date in case of upload
    const cohort = await CohortModel.findOne({ name: cohortName });
    //   await generateCohesionCentersExport(cohort, action);
    await generateYoungsExport(cohort, false, action);
  })();
})();
