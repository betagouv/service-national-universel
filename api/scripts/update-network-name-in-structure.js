require("dotenv").config({ path: "../.env-prod" });

require("../src/mongo");
const StructureModel = require("../src/models/structure");

(async function run() {
  const cursor = StructureModel.find({}).cursor();
  await cursor.eachAsync(async function (structure) {
    try {
      if (structure.networkId) {
        // Get network for the structure
        const network = await StructureModel.findOne({ _id: structure.networkId });
        if (network) {
          console.log(`Update structure #${structure._id} network : ${structure.networkId} : ${network.name}`);
          structure.set({ networkName: `${network.name}` });
          await structure.save();
          await structure.index();
        }
      } else if (structure.isNetwork === "true") {
        console.log(`Update structure #${structure._id} network (structure IS network) : ${structure.name}`);
        structure.set({ networkName: `${structure.name}` });
        await structure.save();
        await structure.index();
      } else {
        console.log(`Skip: structure ${structure._id}`);
      }
    } catch (e) {
      console.log(e);
    }
  });
  console.log("DONE.");
  process.exit(0);
})();
