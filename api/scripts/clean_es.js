require("dotenv").config({ path: "../.env-prod" });
require("../src/mongo");
const MissionModel = require("../src/models/mission");
const YoungModel = require("../src/models/young");
const ReferentModel = require("../src/models/referent");
const StructureModel = require("../src/models/structure");

const esClient = require("../src/es");

(async function fetch() {
  console.log("START");
  // await run("young", async (hit) => {
  //   const obj = await YoungModel.findById(hit._id);
  //   if (obj) return;
  //   console.log("DELETE", hit.email);
  //   await esClient.delete({ index: "young", type: "_doc", refresh: true, id: hit._id });
  // });

  await run("referent", async (hit) => {
    const obj = await ReferentModel.findById(hit._id);
    if (obj) return;
    await esClient.delete({ index: "referent", type: "_doc", refresh: true, id: hit._id });
    console.log("DELETED", hit._id);
  });

  // await run("structure", async (hit) => {
  //   const obj = await StructureModel.findById(hit._id);
  //   if (obj) return;
  //   await esClient.delete({ index: "structure", type: "_doc", refresh: true, id: hit._id });
  //   console.log("DELETED", hit._id);
  // });

  console.log("END");
})();

function run(index, cb) {
  let count = 0;
  return new Promise(async (resolve, reject) => {
    const query = { index: index, type: "_doc", scroll: "10s", body: { query: { match_all: {} } } };
    // const query = { index: index, type: "_doc", scroll: "10s", body: { query: { ids: { values: ["5e42be1a2266541efd4b64f9"] } } } };
    // first we do a search, and specify a scroll timeout
    esClient.search(query, function getMoreUntilDone(error, res) {
      const response = res.body;
      if (!response.hits) console.log("response", response);
      response.hits.hits.forEach(async function (hit) {
        count++;
        if (count % 100 === 0) console.log(count);
        await cb(hit);
      });

      if (response.hits.total !== count) {
        esClient.scroll({ scrollId: response._scroll_id, scroll: "10s" }, getMoreUntilDone);
      } else {
        resolve();
      }
    });
  });
}
