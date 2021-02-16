require("dotenv").config({ path: "../.env-staging" });
require("../src/mongo");
const MissionModel = require("../src/models/mission");
// const YoungModel = require("../src/models/young");
// const ReferentModel = require("../src/models/referent");
// const StructureModel = require("../src/models/structure");

// const esClient = require("../src/es");

(async function fetch() {
  console.log("START");

  // await MissionModel.unsynchronize();
  await run(MissionModel);

  // await run("structure", async (hit) => {
  //   const obj = await StructureModel.findById(hit._id);
  //   if (obj) return;
  //   await esClient.delete({ index: "structure", type: "_doc", refresh: true, id: hit._id });
  //   console.log("DELETED", hit._id);
  // });

  console.log("END");
})();

let count = 0;

async function run(MyModel) {
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
