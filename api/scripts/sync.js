require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const YoungModel = require("../src/models/young");
const StructureModel = require("../src/models/structure");
const MissionModel = require("../src/models/mission");
const ReferentModel = require("../src/models/referent");

const { getQPV } = require("../src/qpv");

(async function fetch() {
  await run(YoungModel);
})();

let count = 0;
async function run(MyModel) {
  const cursor = MyModel.find({ cohort: "2021" }).cursor();
  await cursor.eachAsync(async function (doc) {
    count++;
    if (count % 10 === 0) console.log(count);

    try {
      if (!doc.zip || !doc.city || !doc.address) return;

      const qpv = await getQPV(doc.zip, doc.city, doc.address);
      if (qpv === true) {
        doc.set({ qpv: "true" });
      } else if (qpv === false) {
        doc.set({ qpv: "false" });
      } else {
        doc.set({ qpv: "false" });
      }
      await doc.save();

      // await doc.save();
      // await doc.index();
    } catch (e) {
      console.log("e", e);
    }
  });
}
