require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const ApplicationModel = require("../src/models/application");
const MissionModel = require("../src/models/mission");
const YoungModel = require("../src/models/young");

(async function run() {
  const cursor = ApplicationModel.find({}).cursor();
  let count = 0;
  await cursor.eachAsync(async function (doc) {
    try {
      const young = await YoungModel.findById(doc.youngId);
      if (young) {
        doc.set({ youngCohort: young.cohort });
        await doc.save();
        await doc.index();
        console.log(doc.youngEmail);
        count++;
      } else {
        console.log("NOPE", doc.youngId);
      }
    } catch (e) {
      console.log(e);
    }
  });
  console.log("DONE.", count);
  process.exit(0);
})();
