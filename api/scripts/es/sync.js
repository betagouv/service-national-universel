require("dotenv").config({ path: "../../.env-staging" });

require("../../src/mongo");

const ApplicationModel = require("../../src/models/application");
const MissionModel = require("../../src/models/mission");
const ReferentModel = require("../../src/models/referent");
const StructureModel = require("../../src/models/structure");
const YoungModel = require("../../src/models/young");

(async function fetch() {
  // await run(ApplicationModel);
  // await run(MissionModel);
  // await run(ReferentModel);
  await run(StructureModel);
  // await run(YoungModel);
  process.exit(1);
})();

async function run(MyModel) {
  console.log("START", MyModel);
  let count = 0;
  const cursor = MyModel.find({}).cursor();
  await cursor.eachAsync(async function (doc) {
    count++;
    if (count % 100 === 0) console.log(count);
    try {
      await doc.index();
    } catch (e) {
      console.log("e", e);
    }
  });
}
