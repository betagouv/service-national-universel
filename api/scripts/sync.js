require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");

const esclient = require("../src/es");
const ApplicationModel = require("../src/models/application");
const MissionModel = require("../src/models/mission");
const ReferentModel = require("../src/models/referent");
const StructureModel = require("../src/models/structure");
const YoungModel = require("../src/models/young");

(async function fetch() {
  await run(ApplicationModel, "application");
  await run(MissionModel, "mission");
  await run(ReferentModel, "referent");
  await run(StructureModel, "structure");
  await run(YoungModel, "young");
  process.exit(1);
})();

async function run(MyModel, index) {
  console.log("START", MyModel);
  await esclient.indices.delete({ index });
  let count = 0;
  const cursor = MyModel.find({}).cursor();
  await cursor.eachAsync(async function (doc) {
    count++;
    if (count % 10 === 0) console.log(count);
    try {
      await doc.index();
    } catch (e) {
      console.log("e", e);
    }
  });
}
