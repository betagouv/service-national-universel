require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const YoungModel = require("../src/models/young");
const StructureModel = require("../src/models/structure");
const MissionModel = require("../src/models/mission");
const ReferentModel = require("../src/models/referent");

// (async function fetch() {
//   await run(YoungModel);
//   // await run(StructureModel);
//   // await run(MissionModel);
//   console.log("end");
// })();

// let count = 0;
// async function run(MyModel) {
//   const cursor = MyModel.find({ phase: "INSCRIPTION" }).cursor();
//   await cursor.eachAsync(async function (doc) {
//     count++;
//     if (count % 10 === 0) console.log(count);
//     // await doc.set({ cniFiles: [] });
//     // await doc.set({ parentConsentmentFiles: [] });
//     try {
//       await doc.save();
//       await doc.index();
//     } catch (e) {
//       console.log("e", e);
//     }
//   });
// }

(async function () {
  await ReferentModel.findOneAndUpdate({ email: "gabrielle.bouxin@gmail.com" }, { role: "admin" });
  console.log("updated");
})();

//
