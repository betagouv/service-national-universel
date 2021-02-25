require("dotenv").config({ path: "../.env-staging" });

require("../src/mongo");
const MissionModel = require("../src/models/mission");

(async function fetch() {
  await MissionModel.updateMapping()
  await MissionModel.synchronize()
  // await run(MissionModel);
})();

let count = 0;
async function run(MyModel) {

  // await MissionModel.logMapping()
  
  // const cursor = MyModel.find({}).cursor();
  // await cursor.eachAsync(async function (doc) {
  //   count++;
  //   if (count % 10 === 0) console.log(count);

  //   try {
  //     // console.log("doc", doc);
  //     if (count > 10) return;
  //     await doc.index();
  //     // if (!doc.zip || !doc.city || !doc.address) return;

  //     // const qpv = await getQPV(doc.zip, doc.city, doc.address);
  //     // if (qpv === true) {
  //     //   doc.set({ qpv: "true" });
  //     // } else if (qpv === false) {
  //     //   doc.set({ qpv: "false" });
  //     // } else {
  //     //   doc.set({ qpv: "false" });
  //     // }
  //     // await doc.save();

  //     // await doc.save();
  //     return;
  //   } catch (e) {
  //     console.log("e", e);
  //   }
  // });
}
