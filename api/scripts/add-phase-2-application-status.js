require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const ApplicationModel = require("../src/models/application");
const YoungModel = require("../src/models/young");

(async function run() {
  const cursor = YoungModel.find({}).cursor();
  await cursor.eachAsync(async function (young) {
    const applications = await ApplicationModel.find({ youngId: young._id });
    if (applications && applications.length) {
      try {
        young.set({ phase2ApplicationStatus: applications.map((e) => e.status) });
        await young.save();
        await young.index();
        console.log(young.email, young.phase2ApplicationStatus);
      } catch (e) {
        console.error("error", young.email);
        console.log(e);
      }
    }
  });
  console.log("DONE.");
  process.exit(0);
})();
